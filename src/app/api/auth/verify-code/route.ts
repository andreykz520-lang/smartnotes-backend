import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activationCodes, users, devices } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super_secret_key_for_smartnotes_2026"
);

export async function POST(req: NextRequest) {
  try {
    let { email: rawEmail, code: rawCode, deviceId } = await req.json();

    if (!rawEmail || !rawCode) {
      return NextResponse.json(
        { error: "Заполните все поля (email, код)" },
        { status: 400 }
      );
    }

    if (!deviceId) {
      deviceId = 'device_win_' + Math.random().toString(36).substring(2);
    }

    const email = String(rawEmail).trim().toLowerCase();
    const code = String(rawCode).trim().toUpperCase();

    // 1. Ищем неиспользованный код
    const validCodes = await db
      .select()
      .from(activationCodes)
      .where(
        and(
          eq(activationCodes.email, email),
          eq(activationCodes.code, code),
          eq(activationCodes.isUsed, false)
        )
      );

    let activationRecord = validCodes[0];

    // Если код уже был использован (например, двойной клик или недавняя авторизация в пределах 15 мин)
    if (!activationRecord) {
      const recentCodes = await db
        .select()
        .from(activationCodes)
        .where(
          and(
            eq(activationCodes.email, email),
            eq(activationCodes.code, code),
            eq(activationCodes.isUsed, true)
          )
        )
        .orderBy(desc(activationCodes.activatedAt))
        .limit(1);

      if (
        recentCodes.length > 0 &&
        recentCodes[0].activatedAt &&
        Date.now() - new Date(recentCodes[0].activatedAt).getTime() < 15 * 60 * 1000
      ) {
        activationRecord = recentCodes[0];
      }
    }

    if (!activationRecord) {
      return NextResponse.json(
        { error: "Неверный или устаревший код. Пожалуйста, запросите новый код." },
        { status: 400 }
      );
    }

    // 2. Ищем или создаем пользователя
    let userList = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    let user = userList[0];

    if (!user) {
      // Регистрируем нового пользователя
      const inserted = await db
        .insert(users)
        .values({
          email: email,
          isPro: false,
          isProPlus: false,
        })
        .returning();
      user = inserted[0];
    }

    // Для главного администратора включаем полный доступ
    const isAdmin = email === 'andreykz520@gmail.com' || email === 'autoneuro24@gmail.com';
    
    // Проверяем план кода
    const codePlan = (activationRecord as any).plan || '';
    const shouldBeProPlus = isAdmin || codePlan.includes('pro_plus') || codePlan.includes('plus');
    const shouldBePro = isAdmin || shouldBeProPlus || codePlan === 'pro' || code.length > 6;

    let finalIsPro = user.isPro || shouldBePro;
    let finalIsProPlus = user.isProPlus || shouldBeProPlus;
    let finalProEndedAt = user.proEndedAt;
    
    // Проверяем, использовалось ли это устройство ранее кем-либо
    const globalDevice = await db
      .select()
      .from(devices)
      .where(eq(devices.deviceId, deviceId));
    const isDeviceAlreadyUsed = globalDevice.length > 0;
    
    // Если пользователь новый, не админ и ЭТО УСТРОЙСТВО еще не было в базе, даем 3-дневный триал
    if (!isAdmin && !codePlan && !user.proStartedAt && !isDeviceAlreadyUsed) {
      finalIsPro = true;
      finalIsProPlus = true;
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      finalProEndedAt = threeDaysLater;
    }

    // Проверка на истечение триала/подписки
    if (!isAdmin && finalProEndedAt && new Date(finalProEndedAt).getTime() < Date.now()) {
      finalIsPro = false;
      finalIsProPlus = false;
    }

    if (finalIsPro !== user.isPro || finalIsProPlus !== user.isProPlus || (!user.proStartedAt && finalIsPro) || finalProEndedAt !== user.proEndedAt) {
      const updatedUser = await db
        .update(users)
        .set({ 
          isPro: finalIsPro,
          isProPlus: finalIsProPlus,
          proStartedAt: user.proStartedAt || new Date(),
          proEndedAt: finalProEndedAt,
        })
        .where(eq(users.id, user.id))
        .returning();
      if (updatedUser && updatedUser[0]) {
        user = updatedUser[0];
      }
    }

    // 3. Проверка лимитов устройств и безопасная регистрация
    const userDevices = await db
      .select()
      .from(devices)
      .where(eq(devices.userId, user.id));

    const existingDeviceForUser = userDevices.find((d) => d.deviceId === deviceId);
    const maxDevices = isAdmin ? 100 : ((user.isPro || user.isProPlus) ? 3 : 1);

    if (!existingDeviceForUser) {
      if (userDevices.length >= maxDevices) {
        if (isAdmin || user.isPro || user.isProPlus) {
          // Автоматически ротируем самое старое устройство
          const oldestDevice = userDevices[0];
          await db.delete(devices).where(eq(devices.id, oldestDevice.id));
        } else {
          return NextResponse.json(
            {
              error: `Превышен лимит устройств. На вашем тарифе можно привязать не более ${maxDevices} устройств(а).`,
              canReset: user.deviceResetsCount < 1,
              resetsLeft: Math.max(0, 1 - user.deviceResetsCount)
            },
            { status: 403 }
          );
        }
      }
      
      // Устройство уже найдено выше в переменной globalDevice
      if (globalDevice.length > 0) {
        // Переписываем на текущего пользователя
        await db
          .update(devices)
          .set({ userId: user.id })
          .where(eq(devices.deviceId, deviceId));
      } else {
        // Регистрируем новое устройство
        await db.insert(devices).values({
          userId: user.id,
          deviceId: deviceId,
        });
      }
    }

    // 4. Отмечаем код как использованный (если еще не был отмечен)
    if (!activationRecord.isUsed) {
      await db
        .update(activationCodes)
        .set({
          isUsed: true,
          usedByDeviceId: deviceId,
          activatedAt: new Date(),
        })
        .where(eq(activationCodes.id, activationRecord.id));
    }

    // 5. Генерируем JWT токен
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      deviceId: deviceId,
      isPro: user.isPro,
      isProPlus: user.isProPlus,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("365d") // Токен на год
      .sign(JWT_SECRET);

    return NextResponse.json({
      success: true,
      token,
      user: {
        email: user.email,
        isPro: user.isPro,
        isProPlus: user.isProPlus,
      },
    });
  } catch (error: any) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { error: error?.message || "Ошибка сервера при авторизации" },
      { status: 500 }
    );
  }
}
