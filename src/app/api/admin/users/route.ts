import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, activationCodes, devices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    // Защита паролем
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
    }

    // Получаем всех пользователей с их устройствами
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const allDevices = await db.select().from(devices);
    
    const usersWithDevices = allUsers.map(user => {
      const userDevices = allDevices.filter(d => d.userId === user.id);
      return {
        ...user,
        devicesCount: userDevices.length,
      };
    });

    // Получаем все коды активации
    const allCodes = await db.select().from(activationCodes).orderBy(desc(activationCodes.createdAt));

    return NextResponse.json({ 
      success: true, 
      users: usersWithDevices,
      codes: allCodes
    });

  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
