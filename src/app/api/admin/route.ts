import { NextResponse } from "next/server";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq, sql, and } from "drizzle-orm";

// Verify admin password
const isAdmin = (password: string | null) => {
  const adminPassword = process.env.ADMIN_PASSWORD || "smartnotes_admin_2026";
  return password === adminPassword;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");

  if (!isAdmin(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const proPlusUsersCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isProPlus, true));

    const proUsersCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.isPro, true), eq(users.isProPlus, false)));
    
    const freeUsersCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isPro, false));

    const proPlusCount = proPlusUsersCountResult[0]?.count || 0;
    const proCount = proUsersCountResult[0]?.count || 0;
    const freeCount = freeUsersCountResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      stats: {
        proPlus: Number(proPlusCount),
        pro: Number(proCount),
        free: Number(freeCount),
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, password, action = 'grant_pro' } = await req.json();

    if (!isAdmin(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (action === 'delete_user') {
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      await db.delete(users).where(eq(users.email, email));
      return NextResponse.json({ success: true, message: `Пользователь ${email} успешно удален.` });
    }

    if (action === 'revoke_pro') {
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (!existingUser.isPro && !existingUser.isProPlus) {
        return NextResponse.json({ success: true, message: `У ${email} и так нет PRO статуса.` });
      }
      await db.update(users).set({ isPro: false, isProPlus: false }).where(eq(users.email, email));
      return NextResponse.json({ success: true, message: `Все PRO статусы убраны у ${email}.` });
    }

    if (action === 'grant_pro_plus') {
      if (!existingUser) {
        await db.insert(users).values({
          email,
          isPro: true,
          isProPlus: true,
        });
        return NextResponse.json({ success: true, message: `Создан новый пользователь ${email} и выдан PRO+ !` });
      } else {
        if (existingUser.isProPlus) {
          return NextResponse.json({ success: true, message: `У ${email} уже есть PRO+ статус.` });
        }
        await db.update(users).set({ isPro: true, isProPlus: true }).where(eq(users.email, email));
        return NextResponse.json({ success: true, message: `Выдан PRO+ статус для ${email}!` });
      }
    }

    // Default action: grant_pro
    if (!existingUser) {
      // Create a PRO user placeholder if they haven't registered yet
      await db.insert(users).values({
        email,
        isPro: true,
      });
      return NextResponse.json({ success: true, message: `Создан новый пользователь ${email} и выдан PRO!` });
    } else {
      if (existingUser.isPro && !existingUser.isProPlus) {
        return NextResponse.json({ success: true, message: `У ${email} уже есть PRO статус.` });
      }
      
      // Update existing user to PRO (but remove PRO+ if they had it)
      await db.update(users).set({ isPro: true, isProPlus: false }).where(eq(users.email, email));
      return NextResponse.json({ success: true, message: `Выдан PRO статус для ${email}!` });
    }
  } catch (error) {
    console.error("Error modifying user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
