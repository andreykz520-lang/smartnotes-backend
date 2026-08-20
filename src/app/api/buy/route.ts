import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, plan } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
       console.error("YooKassa credentials not configured");
       return NextResponse.json({ error: 'Сервер оплат временно недоступен' }, { status: 500 });
    }

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
    const idempotenceKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const origin = request.headers.get('origin') || 'https://smartnotes-backend-two.vercel.app';

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
      return NextResponse.json({ error: 'Не удалось создать платеж. Попробуйте позже.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
