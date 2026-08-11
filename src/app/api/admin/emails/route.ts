import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { users } from "../../../../db/schema";
import { desc } from "drizzle-orm";

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
    const allUsers = await db
      .select({ email: users.email })
      .from(users)
      .orderBy(desc(users.createdAt));

    const emails = allUsers.map(u => u.email).filter(Boolean);

    return NextResponse.json({
      success: true,
      emails,
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
