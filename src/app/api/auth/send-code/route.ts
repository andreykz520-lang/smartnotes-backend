import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activationCodes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email;

    if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.includes("@")) {
      return NextResponse.json({ error: "Введите корректный email" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();

    // Создаем случайный 6-значный код
    const code = generateCode();

    // Сохраняем код в базу
    await db.insert(activationCodes).values({
      email: email,
      code: code,
      isUsed: false,
    });

    // Отправляем письмо через Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "SmartNotes AI <no-reply@smartnotes-ai.ru>", 
        to: email,
        subject: "Код для входа в SmartNotes",
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
                 <h2 style="color: #6366f1; margin-top: 0;">SmartNotes AI</h2>
                 <p style="font-size: 16px;">Ваш код для входа в приложение:</p>
                 <div style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #111; padding: 15px 0; background: #f3f4f6; text-align: center; border-radius: 6px; margin: 15px 0;">${code}</div>
                 <p style="color: #666; font-size: 14px;">Введите этот 6-значный код на экране входа в приложении.</p>
                 <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">Если вы не запрашивали вход, просто проигнорируйте это письмо.</p>
               </div>`,
      });
    } else {
      // Для отладки, если нет ключа Resend
      console.log(`[DEBUG] Activation code for ${email} is ${code}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending code:", error);
    return NextResponse.json(
      { error: "Не удалось отправить код на почту" },
      { status: 500 }
    );
  }
}
