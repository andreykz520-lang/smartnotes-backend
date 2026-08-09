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
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Создаем случайный 6-значный код
    const code = generateCode();

    // Сохраняем код в базу (инвалидируем старые коды для этого email, если нужно)
    // В текущей схеме можно просто добавить новый код для email
    await db.insert(activationCodes).values({
      email: email.toLowerCase(),
      code: code,
      isUsed: false,
    });

    // Отправляем письмо через Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "SmartNotes AI <no-reply@smartnotes.online>", // TODO: Заменить на актуальный домен
        to: email,
        subject: "Код активации SmartNotes AI",
        html: `<p>Ваш код для входа в приложение:</p>
               <h2>${code}</h2>
               <p>Введите его в приложении, чтобы активировать вашу копию.</p>`,
      });
    } else {
      // Для отладки, если нет ключа Resend
      console.log(`[DEBUG] Activation code for ${email} is ${code}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending code:", error);
    return NextResponse.json(
      { error: "Failed to send code" },
      { status: 500 }
    );
  }
}
