import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activationCodes, users, devices } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super_secret_key_for_smartnotes_2026"
);

export async function POST(req: NextRequest) {
  try {
    const { email, code, deviceId } = await req.json();

    if (!email || !code || !deviceId) {
      return NextResponse.json(
        { error: "Missing email, code or deviceId" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // 1. Ищем код
    const validCodes = await db
      .select()
      .from(activationCodes)
      .where(
        and(
          eq(activationCodes.email, emailLower),
          eq(activationCodes.code, code),
          eq(activationCodes.isUsed, false)
        )
      );

    if (validCodes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    const activationRecord = validCodes[0];

    // 2. Ищем или создаем пользователя
    let userList = await db
      .select()
      .from(users)
      .where(eq(users.email, emailLower));

    let user = userList[0];

    if (!user) {
      // Регистрируем нового пользователя (по умолчанию Free)
      const inserted = await db
        .insert(users)
        .values({
          email: emailLower,
          isPro: false,
        })
        .returning();
      user = inserted[0];
    }

    // 3. Проверка лимитов устройств
    const userDevices = await db
      .select()
      .from(devices)
      .where(eq(devices.userId, user.id));

    const existingDevice = userDevices.find((d) => d.deviceId === deviceId);
    
    // Лимит: 3 для PRO, 1 для Free
    const maxDevices = user.isPro ? 3 : 1;

    if (!existingDevice) {
      if (userDevices.length >= maxDevices) {
        return NextResponse.json(
          {
            error: `Device limit reached. You can only link ${maxDevices} device(s) on your current plan.`,
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

    // 4. Отмечаем код как использованный
    await db
      .update(activationCodes)
      .set({
        isUsed: true,
        usedByDeviceId: deviceId,
        activatedAt: new Date(),
      })
      .where(eq(activationCodes.id, activationRecord.id));

    // 5. Генерируем JWT токен
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      deviceId: deviceId,
      isPro: user.isPro,
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
      },
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
