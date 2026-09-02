import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, plan } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Боевой магазин ЮKassa
    const shopId = '1418145';
    const secretKey = 'live_9ZgCsG1u-hTnBURIWcVPYqASSQmDdxtBEOSi_uAHl4Y';


    let amountValue = '150.00';
    let description = 'SmartNotes AI - Подписка PRO+ (1 месяц)';

    if (plan === 'pro') {
      amountValue = '500.00';
      description = 'SmartNotes AI - PRO Версия (Навсегда)';
    } else if (plan === 'pro_plus_3m') {
      amountValue = '390.00';
      description = 'SmartNotes AI - Подписка PRO+ (3 месяца, скидка)';
    } else if (plan === 'pro_plus_6m') {
      amountValue = '790.00';
      description = 'SmartNotes AI - Подписка PRO+ (6 месяцев) + Вечный PRO в подарок!';
    } else {
      // pro_plus or pro_plus_1m
      amountValue = '150.00';
      description = 'SmartNotes AI - Подписка PRO+ (1 месяц)';
    }

    const authString = Buffer.from(`${shopId}:${secretKey}`).toString('base64');
    const idempotenceKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now();

    const origin = request.headers.get('origin') || 'https://smartnotes-ai.ru';

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          value: amountValue,
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${origin}/success`, 
        },
        description: description,
        metadata: {
          email: email.trim().toLowerCase(),
          plan: plan || 'pro_plus_1m',
        },
      }),
    });

    const data = await response.json();

    if (data.confirmation && data.confirmation.confirmation_url) {
      return NextResponse.json({ success: true, paymentUrl: data.confirmation.confirmation_url });
    } else {
      console.error('YooKassa Error:', data);
      return NextResponse.json({ error: data.description || 'Не удалось создать платеж в ЮKassa. Попробуйте позже.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

