import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super_secret_key_for_smartnotes_2026"
);

export async function POST(req: NextRequest) {
  try {
    let email = "";
    
    // Пытаемся получить email из body
    try {
      const body = await req.json();
      if (body?.email) email = String(body.email).trim().toLowerCase();
    } catch {}

    // Если нет в body, пробуем из Bearer JWT токена
    if (!email) {
      const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
      const token = authHeader.replace(/^Bearer\s*/i, "").trim();
      if (token) {
        try {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          if (payload?.email) email = String(payload.email).trim().toLowerCase();
        } catch {}
      }
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const foundUsers = await db.select().from(users).where(eq(users.email, email));
    let user = foundUsers[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = email === 'andreykz520@gmail.com' || email === 'autoneuro24@gmail.com' || email === 'andreykz@yahoo.com';

    let isPro = user.isPro;
    let isProPlus = user.isProPlus;
    let isExpired = false;

    // Проверяем срок действия
    if (!isAdmin && user.proEndedAt && new Date(user.proEndedAt).getTime() < Date.now()) {
      isPro = false;
      isProPlus = false;
      isExpired = true;

      // Обновляем в БД
      await db
        .update(users)
        .set({ isPro: false, isProPlus: false })
        .where(eq(users.id, user.id));
    }

    let daysLeft = 0;
    if (user.proEndedAt && !isExpired) {
      const diffMs = new Date(user.proEndedAt).getTime() - Date.now();
      daysLeft = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        isPro,
        isProPlus,
        proStartedAt: user.proStartedAt,
        proEndedAt: user.proEndedAt,
        daysLeft,
        isExpired,
      }
    });

  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
