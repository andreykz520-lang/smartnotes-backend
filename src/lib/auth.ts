import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super_secret_key_for_smartnotes_2026"
);

export async function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid token", status: 401 };
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Опционально: можно проверять, не был ли удален пользователь из БД, 
    // или не истекла ли его PRO подписка.
    
    // Обновляем статус PRO напрямую из базы
    const user = await db
      .select({ isPro: users.isPro })
      .from(users)
      .where(eq(users.id, payload.userId as number))
      .limit(1);
      
    if (user.length === 0) {
      return { error: "User not found", status: 404 };
    }

    return { 
      user: {
        userId: payload.userId as number,
        email: payload.email as string,
        deviceId: payload.deviceId as string,
        isPro: user[0].isPro,
      }
    };
  } catch (err) {
    return { error: "Invalid or expired token", status: 401 };
  }
}
