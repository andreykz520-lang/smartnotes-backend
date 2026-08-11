import { NextResponse } from "next/server";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq, sql } from "drizzle-orm";

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
    const proUsersCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isPro, true));
    
    const freeUsersCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isPro, false));

    const proCount = proUsersCountResult[0]?.count || 0;
    const freeCount = freeUsersCountResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      stats: {
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
    const { email, password } = await req.json();

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

    if (!existingUser) {
      // Create a PRO user placeholder if they haven't registered yet
      await db.insert(users).values({
        email,
        isPro: true,
      });
      return NextResponse.json({ success: true, message: `Created new user ${email} with PRO status!` });
    } else {
      if (existingUser.isPro) {
        return NextResponse.json({ success: true, message: `User ${email} already has PRO status.` });
      }
      
      // Update existing user to PRO
      await db.update(users).set({ isPro: true }).where(eq(users.email, email));
      return NextResponse.json({ success: true, message: `Granted PRO status to ${email}!` });
    }
  } catch (error) {
    console.error("Error granting PRO:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
