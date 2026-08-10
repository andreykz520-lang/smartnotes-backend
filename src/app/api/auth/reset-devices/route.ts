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

    // 1. Verify code
    const validCodes = await db
      .select()
      .from(activationCodes)
      .where(
        and(
          eq(activationCodes.email, emailLower),
          eq(activationCodes.code, code),
          eq(activationCodes.isUsed, false) // Note: it must be a valid unused code. 
          // Wait, if they are resetting, the code they entered is fresh. 
          // Or wait, they enter their old code? No, they request a new code to login!
          // So the code is fresh and unused.
        )
      );

    if (validCodes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    const activationRecord = validCodes[0];

    // 2. Find user
    const userList = await db
      .select()
      .from(users)
      .where(eq(users.email, emailLower));

    const user = userList[0];

    if (!user) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Check reset limits
    if (user.deviceResetsCount >= 1) {
       return NextResponse.json({ error: "Reset limit reached. You can only reset your devices once." }, { status: 403 });
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
      },
    });

  } catch (error) {
    console.error("Error resetting devices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
