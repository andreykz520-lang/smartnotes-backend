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
    const { email: rawEmail, code: rawCode, deviceId } = await req.json();

    if (!rawEmail || !rawCode || !deviceId) {
      return NextResponse.json(
        { error: "Заполните все поля" },
        { status: 400 }
      );
    }

    const email = String(rawEmail).trim().toLowerCase();
    const code = String(rawCode).trim().toUpperCase();

    // 1. Verify code
    const validCodes = await db
      .select()
      .from(activationCodes)
      .where(
        and(
          eq(activationCodes.email, email),
          eq(activationCodes.code, code)
        )
      );

    if (validCodes.length === 0) {
      return NextResponse.json(
        { error: "Неверный или устаревший код" },
        { status: 400 }
      );
    }

    const activationRecord = validCodes[0];

    // 2. Find user
    const userList = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    const user = userList[0];

    if (!user) {
       return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    // 3. Check reset limits
    if (user.deviceResetsCount >= 1) {
       return NextResponse.json({ error: "Вы уже использовали разовый сброс устройств. Обратитесь в поддержку." }, { status: 403 });
    }

    // 4. Delete all old devices
    await db.delete(devices).where(eq(devices.userId, user.id));

    // 5. Insert new device
    await db.insert(devices).values({
      userId: user.id,
      deviceId: deviceId,
    });

    // 6. Update user's reset count
    await db.update(users).set({
      deviceResetsCount: user.deviceResetsCount + 1
    }).where(eq(users.id, user.id));

    // 7. Mark code as used
    await db
      .update(activationCodes)
      .set({
        isUsed: true,
        usedByDeviceId: deviceId,
        activatedAt: new Date(),
      })
      .where(eq(activationCodes.id, activationRecord.id));

    // 8. Generate JWT
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      deviceId: deviceId,
      isPro: user.isPro,
      isProPlus: user.isProPlus,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("365d")
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
    console.error("Error resetting devices:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
