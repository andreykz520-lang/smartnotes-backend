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

    const isProCode = code.length > 6;
    if (isProCode && !user.isPro) {
      const updatedUser = await db
        .update(users)
        .set({ isPro: true })
        .where(eq(users.id, user.id))
        .returning();
      user = updatedUser[0];
    }

    // 3. Проверка лимитов устройств
    const userDevices = await db
      .select()
      .from(devices)
      .where(eq(devices.userId, user.id));

    const existingDevice = userDevices.find((d) => d.deviceId === deviceId);
    
    // Лимит: 3 для PRO/PRO+, 1 для Free
    const maxDevices = (user.isPro || user.isProPlus) ? 3 : 1;

    if (!existingDevice) {
      if (userDevices.length >= maxDevices) {
        return NextResponse.json(
          {
            error: `Превышен лимит устройств. На вашем тарифе можно привязать не более ${maxDevices} устройств(а).`,
            canReset: user.deviceResetsCount < 1,
            resetsLeft: Math.max(0, 1 - user.deviceResetsCount)
          },
          { status: 403 }
        );
      }
      
      // Регистрируем новое устройство
      await db.insert(devices).values({
        userId: user.id,
        deviceId: deviceId,
      });
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
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
