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

async function sendStarsInvoice(chatId: number | string, plan: 'pro_plus' | 'pro', userEmail?: string) {
  const isProPlus = plan === 'pro_plus';
  const starsAmount = isProPlus ? 150 : 500;
  const title = isProPlus ? '👑 SmartNotes PRO+ (1 месяц)' : '⭐ SmartNotes PRO (Навсегда)';
  const description = isProPlus
    ? 'Встроенный ИИ Gemini 3.7 Flash, распознавание фото, голосовая диктовка на лету и облачная синхронизация на 3 устройства.'
    : 'Бессрочная облачная синхронизация на 3 устройства, экспорт в PDF, секретные заметки с PIN и поддержка своих API-ключей.';

  const payload = JSON.stringify({
    plan,
    email: userEmail || '',
    chatId,
    timestamp: Date.now(),
  });

  try {
    const res = await fetch(`${TELEGRAM_API}/sendInvoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        title,
        description,
        payload,
        provider_token: '', // Пустая строка для Telegram Stars
        currency: 'XTR',    // Официальная валюта Telegram Stars
        prices: [
          {
            label: isProPlus ? 'SmartNotes PRO+ (30 дней)' : 'SmartNotes PRO (Lifetime)',
            amount: starsAmount, // 150 или 500 звезд
          },
        ],
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('sendInvoice failed:', data);
      await sendMessage(
        chatId,
        `❌ Ошибка при выставлении счета: ${data.description || 'Попробуйте позже'}`
      );
    }
  } catch (e) {
    console.error('Telegram sendStarsInvoice error:', e);
  }
}

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // 1. ПОДТВЕРЖДЕНИЕ ПРЕДОПЛАТЫ (PreCheckoutQuery)
    if (update.pre_checkout_query) {
      const queryId = update.pre_checkout_query.id;
      await fetch(`${TELEGRAM_API}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: queryId,
          ok: true,
        }),
      });
      return NextResponse.json({ ok: true });
    }

    // 2. ОБРАБОТКА УСПЕШНОЙ ОПЛАТЫ (SuccessfulPayment)
    if (update.message?.successful_payment) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const payment = msg.successful_payment;

      let payloadData: any = {};
      try {
        payloadData = JSON.parse(payment.invoice_payload);
      } catch (e) {
        payloadData = { plan: 'pro_plus', email: '' };
      }

      const plan: 'pro_plus' | 'pro' = payloadData.plan === 'pro' ? 'pro' : 'pro_plus';
      const isProPlus = plan === 'pro_plus';
      const rawEmail = (payloadData.email || `tg_${chatId}@smartnotes.app`).trim().toLowerCase();

      const now = new Date();
      const proEndedAt = isProPlus ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : null;

      // 1. Активация в базе данных
      const existingUser = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, rawEmail),
      });

      if (existingUser) {
        await db.update(users).set({
          isPro: true,
          isProPlus: isProPlus,
          proStartedAt: now,
          proEndedAt: proEndedAt,
          updatedAt: now,
        }).where(eq(users.id, existingUser.id));
      } else {
        await db.insert(users).values({
          email: rawEmail,
          isPro: true,
          isProPlus: isProPlus,
          proStartedAt: now,
          proEndedAt: proEndedAt,
        });
      }

      // 2. Генерация красивого кода активации
      const rawCode = crypto.randomBytes(8).toString('hex').toUpperCase();
      const formattedCode = rawCode.match(/.{1,4}/g)?.join('-') || rawCode;

      await db.insert(activationCodes).values({
        code: formattedCode,
        email: rawEmail,
      });

      // 3. Отправка Email чека, если указан реальный email
      if (rawEmail && !rawEmail.startsWith('tg_') && process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'SmartNotes AI <noreply@smartnotes-ai.ru>',
            to: [rawEmail],
            subject: `🎉 Ваш код активации SmartNotes ${isProPlus ? 'PRO+' : 'PRO'}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0A0A0A; color: #fff; border-radius: 16px;">
                <h1 style="color: #A855F7;">Оплата успешно завершена! 🎉</h1>
                <p>Спасибо за приобретение <strong>SmartNotes ${isProPlus ? 'PRO+ (ИИ Gemini 3.7)' : 'PRO (Навсегда)'}</strong> через Telegram Stars.</p>
                <div style="background-color: #1F1F2E; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center;">
                  <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #fff;">${formattedCode}</span>
                </div>
                <p><strong>Как активировать в приложении:</strong></p>
                <ol style="color: #ccc; line-height: 1.6;">
                  <li>Откройте приложение <strong>SmartNotes AI</strong> на телефоне.</li>
                  <li>Перейдите во вкладку <strong>Настройки</strong>.</li>
                  <li>Введите ваш Email (<code>${rawEmail}</code>) или код активации выше.</li>
                  <li>Все функции PRO активируются мгновенно!</li>
                </ol>
                <p style="color: #888; font-size: 12px; margin-top: 30px;">Команда SmartNotes AI</p>
              </div>
            `,
          });
        } catch (e) {
          console.warn('Could not send email receipt:', e);
        }
      }

      // 4. Поздравление и код прямо в Telegram
      const successText = `🎉 <b>Оплата ${payment.total_amount} ⭐ успешно завершена!</b>\n\nТариф: <b>SmartNotes ${isProPlus ? 'PRO+ с ИИ (30 дней)' : 'PRO (Навсегда)'}</b>\n\n🔑 <b>Ваш код активации:</b>\n<code>${formattedCode}</code>\n\n<b>Как активировать в приложении:</b>\n1. Откройте приложение <b>SmartNotes</b> на телефоне.\n2. Перейдите в <b>«Настройки»</b>.\n3. Введите ваш код активации или Email (<code>${rawEmail}</code>).\n\n<i>Все премиум-возможности активируются моментально!</i>`;

      await sendMessage(chatId, successText);
      return NextResponse.json({ ok: true });
    }

    // 3. ОБРАБОТКА ОБЫЧНЫХ СООБЩЕНИЙ
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = (msg.text || '').trim();

      if (text.startsWith('/start')) {
        const startParam = text.split(' ')[1] || '';

        if (startParam.startsWith('pro_plus') || startParam.startsWith('pro')) {
          const parts = startParam.split('_');
          const isProPlus = parts[0] === 'pro' && parts[1] === 'plus';
          const plan: 'pro_plus' | 'pro' = isProPlus ? 'pro_plus' : 'pro';
          const userEmail = parts.slice(isProPlus ? 2 : 1).join('_');

          await sendStarsInvoice(chatId, plan, userEmail);
          return NextResponse.json({ ok: true });
        }

        const keyboard = {
          inline_keyboard: [
            [
              { text: '👑 PRO+ с ИИ (150 ⭐ • $3 / мес)', callback_data: 'buy_stars_pro_plus' },
            ],
            [
              { text: '⭐ PRO Версия (500 ⭐ • $10 навсегда)', callback_data: 'buy_stars_pro' },
            ],
            [
              { text: '🌐 Официальный сайт', url: 'https://smartnotes-ai.ru' },
            ],
          ],
        };

        const welcomeText = `👋 <b>Добро пожаловать в SmartNotes AI!</b>\n\nОфициальный бот для мгновенной оплаты подписки через <b>Telegram Stars (Звёзды)</b> по всему миру.\n\n<b>Выберите тариф для выставления счета:</b>\n\n👑 <b>PRO+ с ИИ (Gemini 3.7 Flash)</b> — 150 ⭐ ($3/мес)\n• Встроенный ИИ без своих ключей\n• Голосовая диктовка на лету\n• Распознавание фото и саммари\n• Облачная синхронизация на 3 устройства\n\n⭐ <b>PRO Версия</b> — 500 ⭐ ($10 разово)\n• Бессрочный доступ на 3 устройства\n• Экспорт в PDF и секретные заметки с PIN\n• Возможность ввода своих API-ключей`;

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
              { text: '👑 Оплатить PRO+ (150 ⭐)', callback_data: `invoice_pro_plus_${email}` },
            ],
            [
              { text: '⭐ Оплатить PRO (500 ⭐)', callback_data: `invoice_pro_${email}` },
            ],
          ],
        };

        await sendMessage(
          chatId,
          `✅ <b>Email сохранен:</b> <code>${email}</code>\n\nВыберите тариф для выставления счета в Telegram Stars:`,
          keyboard
        );
        return NextResponse.json({ ok: true });
      }

      // Обычный текст
      await sendMessage(
        chatId,
        '💡 Чтобы выставить счет и привязать подписку к вашему аккаунту, отправьте команду /start или введите ваш <b>Email</b>:'
      );
      return NextResponse.json({ ok: true });
    }

    // 4. ОБРАБОТКА НАЖАТИЙ НА КНОПКИ (CallbackQuery)
    if (update.callback_query) {
      const query = update.callback_query;
      const chatId = query.message.chat.id;
      const data = query.data || '';

      if (data === 'buy_stars_pro_plus') {
        await sendStarsInvoice(chatId, 'pro_plus');
        return NextResponse.json({ ok: true });
      }

      if (data === 'buy_stars_pro') {
        await sendStarsInvoice(chatId, 'pro');
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith('invoice_')) {
        const parts = data.split('_');
        const plan: 'pro_plus' | 'pro' = parts[1] === 'pro' && parts[2] === 'plus' ? 'pro_plus' : 'pro';
        const userEmail = parts[parts.length - 1];

        await sendStarsInvoice(chatId, plan, userEmail);
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
  return NextResponse.json({ status: 'Telegram bot webhook endpoint is active with Telegram Stars support' });
}
