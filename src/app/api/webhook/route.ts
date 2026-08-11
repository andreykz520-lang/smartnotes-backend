export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { activationCodes } from '@/db/schema';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.event !== 'payment.succeeded' && body.event !== 'payment.waiting_for_capture') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const email = body.object?.metadata?.email;
    const language = body.object?.metadata?.language || 'ru';
    
    if (!email) return NextResponse.json({ error: 'No email metadata' });

    // 1. Генерируем код
    const rawCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    const formattedCode = rawCode.match(/.{1,4}/g)?.join('-') || rawCode;

    // 2. Пишем в базу
    const [newCode] = await db.insert(activationCodes).values({
      code: formattedCode,
      email: email,
    }).returning();

    // 3. Формируем красивое письмо (на 2-х языках)
    // 3. Формируем красивое письмо
    const t = {
      subject: 'Ваш код активации PRO 👑 - SmartNotes AI',
      title: 'Спасибо за покупку!',
      intro: 'Ваш код активации PRO для SmartNotes AI готов:',
      instructions: 'Чтобы активировать PRO функции:',
      step1: 'Откройте приложение SmartNotes AI',
      step2: 'Введите ваш email и этот код на экране входа',
      step3: 'Наслаждайтесь умными функциями и облачной синхронизацией!',
      support: 'Нужна помощь? Напишите нам: support@smartnotes.ai',
      footer: 'Этот код действителен для активации до 3-х устройств (один аккаунт).'
    };

    const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
        <h1 style="color: #9333ea; margin: 0; font-size: 24px;">SmartNotes AI PRO</h1>
      </div>
      <div style="padding: 20px 0;">
        <h2 style="color: #1f2937; font-size: 20px;">${t.title}</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">${t.intro}</p>
        
        <div style="background-color: #faf5ff; border: 2px dashed #9333ea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <div style="font-family: monospace; font-size: 28px; font-weight: bold; color: #7e22ce; letter-spacing: 2px;">
            ${newCode.code}
          </div>
        </div>

        <h3 style="color: #374151; font-size: 16px;">${t.instructions}</h3>
        <ol style="color: #4b5563; font-size: 15px; line-height: 1.6; padding-left: 20px;">
          <li>${t.step1}</li>
          <li><strong>${t.step2}</strong></li>
          <li>${t.step3}</li>
        </ol>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0;">${t.support}</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">${t.footer}</p>
      </div>
    </div>
    `;

    // 4. Отправляем письмо с ПРАВИЛЬНЫМ FROM (без скобок!)
    const { error } = await resend.emails.send({
      from: 'support@smartnotes-ai.ru', 
      to: email,
      subject: t.subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Ошибка Resend:", error);
      return NextResponse.json({ success: false, error });
    }

    return NextResponse.json({ success: true, code: newCode.code });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
