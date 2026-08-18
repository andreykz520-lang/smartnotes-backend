import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, activationCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8638815103:AAFEcDyM_CX1Z2wj5ERC0gsOjLZL25mjwAA';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

async function sendMessage(chatId: number | string, text: string, replyMarkup?: any) {
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
  } catch (e) {
    console.error('Telegram sendMessage error:', e);
  }
}

export async function POST(request: Request) {
  try {
    const update = await request.json();

    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = (msg.text || '').trim();

      if (text.startsWith('/start')) {
        const keyboard = {
          inline_keyboard: [
            [
              { text: '👑 PRO+ с ИИ ($3 / месяц)', callback_data: 'buy_pro_plus' },
            ],
            [
              { text: '⭐ PRO Версия ($10 навсегда)', callback_data: 'buy_pro' },
            ],
            [
              { text: '🌐 Официальный сайт', url: 'https://smartnotes-backend-two.vercel.app' },
            ],
          ],
        };

        const welcomeText = `👋 <b>Добро пожаловать в SmartNotes AI!</b>\n\nЗдесь вы можете приобрести подписку или PRO-доступ для использования приложения по всему миру.\n\n<b>Выберите интересующий тариф:</b>\n\n👑 <b>PRO+ (ИИ Gemini 3.7 Flash)</b> — $3 / месяц\n• Встроенный ИИ без своих ключей\n• Голосовая транскрипция и умные напоминания\n• Облачная синхронизация заметок\n\n⭐ <b>PRO Версия</b> — $10 навсегда\n• Облачная синхронизация на 3 устройства\n• Экспорт в PDF и секретные заметки\n• Возможность ввода своих API-ключей`;

        await sendMessage(chatId, welcomeText, keyboard);
        return NextResponse.json({ ok: true });
      }

      // Если пользователь прислал email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(text)) {
        const email = text.toLowerCase();
        
        const keyboard = {
          inline_keyboard: [
            [
              { text: '💳 Оплатить PRO+ ($3 / мес)', callback_data: `pay_pro_plus_${email}` },
            ],
            [
              { text: '💳 Оплатить PRO ($10 навсегда)', callback_data: `pay_pro_${email}` },
            ],
          ],
        };

        await sendMessage(
          chatId,
          `✅ <b>Email принят:</b> <code>${email}</code>\n\nВыберите тариф для перехода к международной оплате:`,
          keyboard
        );
        return NextResponse.json({ ok: true });
      }

      // Обычный текст
      await sendMessage(
        chatId,
        '💡 Чтобы привязать аккаунт и оплатить подписку, <b>отправьте ваш Email</b> (который вы используете в приложении):'
      );
      return NextResponse.json({ ok: true });
    }

    if (update.callback_query) {
      const query = update.callback_query;
      const chatId = query.message.chat.id;
      const data = query.data || '';

      if (data === 'buy_pro_plus' || data === 'buy_pro') {
        const isProPlus = data === 'buy_pro_plus';
        await sendMessage(
          chatId,
          `📝 Вы выбрали: <b>${isProPlus ? 'PRO+ ($3/мес)' : 'PRO ($10 навсегда)'}</b>.\n\nПожалуйста, <b>напишите ваш Email</b> в ответном сообщении, чтобы мы могли привязать подписку к вашему аккаунту:`
        );
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith('pay_')) {
        const parts = data.split('_');
        const plan = parts[1] === 'pro' && parts[2] === 'plus' ? 'pro_plus' : 'pro';
        const email = parts[parts.length - 1];

        const isProPlus = plan === 'pro_plus';
        const amount = isProPlus ? '$3.00' : '$10.00';

        await sendMessage(
          chatId,
          `🧾 <b>Счет на оплату:</b>\n\n• Тариф: <b>${isProPlus ? 'SmartNotes PRO+ (1 месяц)' : 'SmartNotes PRO (Навсегда)'}</b>\n• Сумма: <b>${amount}</b>\n• Email для активации: <code>${email}</code>\n\nДля завершения оплаты перейдите на страницу покупки:\n👉 https://smartnotes-backend-two.vercel.app/buy?plan=${plan}&email=${encodeURIComponent(email)}`
        );
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: String(error) });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram bot webhook endpoint is active' });
}
