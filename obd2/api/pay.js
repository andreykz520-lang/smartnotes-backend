// Vercel Serverless Compatibility Wrapper
function compatMiddleware(res) {
  if (!res.status) res.status = function(code) { this.statusCode = code; return this; };
  if (!res.json) res.json = function(data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
  };
  if (!res.send) res.send = function(data) { this.end(data); };
}

const { store, PERMANENT_KEYS } = require('../db');
let Resend = null;
try {
  Resend = require('resend').Resend;
} catch (e) {}

function getResend() {
  if (!Resend) {
    try { Resend = require('resend').Resend; } catch (e) {}
  }
  const envKey = (process.env.RESEND_API_KEY || '').trim();
  const apiKey = (envKey && envKey !== '[SENSITIVE]') ? envKey : (store.settings?.resendApiKey || PERMANENT_KEYS.RESEND_API_KEY);
  if (!apiKey || !Resend) return null;
  return new Resend(apiKey);
}

function getYooKassaCredentials() {
  const envShopId = (process.env.YOOKASSA_SHOP_ID || '').trim();
  const envSecretKey = (process.env.YOOKASSA_SECRET_KEY || '').trim();
  
  const storeShopId = (store.settings?.yookassaShopId || '').trim();
  const storeSecretKey = (store.settings?.yookassaSecretKey || '').trim();

  const shopId = (storeShopId || (envShopId && envShopId !== '[SENSITIVE]' ? envShopId : PERMANENT_KEYS.YOOKASSA_SHOP_ID));
  const secretKey = (storeSecretKey || (envSecretKey && envSecretKey !== '[SENSITIVE]' ? envSecretKey : PERMANENT_KEYS.YOOKASSA_SECRET_KEY));

  return { shopId, secretKey };
}

function generateRandomCode(prefix = 'PRO1') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${part1}-${part2}-${part3}`;
}

module.exports = async (req, res) => {
  compatMiddleware(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body || {};
    const buyerEmail = (body.email || req.query.email || '').trim().toLowerCase();
    const plan = (body.plan || req.query.plan || 'pro').toLowerCase();
    const currencyParam = (body.currency || req.query.currency || 'RUB').toUpperCase();

    const isPlus = (plan === 'plus' || plan === 'ai' || plan === 'pro_plus');
    const isUsd = (currencyParam === 'USD');

    // Настройка тарифов
    // PRO+ 1m: 150 руб (СНГ) / 3 USD
    // PRO+ 3m: 390 руб (СНГ) / 7.50 USD
    // PRO+ 6m: 790 руб (СНГ) / 15 USD (+ Подарок Вечный PRO)
    // PRO: 500 руб (СНГ) / 10 USD
    let amountValue = '500.00';
    let currency = 'RUB';
    let codePrefix = 'PRO1';
    let planTitle = 'OBD2 SCAN AI PRO (Бессрочная лицензия)';
    let tier = 'PRO';
    let durationDays = 0;

    if (plan === 'pro_plus_6m' || plan === '6m') {
      tier = 'PRO_PLUS_6M';
      codePrefix = 'PL6M';
      planTitle = 'OBD2 SCAN AI PRO+ на 6 месяцев (+ Вечный PRO в подарок 🎁)';
      durationDays = 180;
      if (isUsd) {
        amountValue = '15.00';
        currency = 'USD';
      } else {
        amountValue = '790.00';
        currency = 'RUB';
      }
    } else if (plan === 'pro_plus_3m' || plan === '3m') {
      tier = 'PRO_PLUS_3M';
      codePrefix = 'PL3M';
      planTitle = 'OBD2 SCAN AI PRO+ на 3 месяца (Скидка ~13%) 🔥';
      durationDays = 90;
      if (isUsd) {
        amountValue = '7.50';
        currency = 'USD';
      } else {
        amountValue = '390.00';
        currency = 'RUB';
      }
    } else if (isPlus || plan === 'pro_plus_1m' || plan === '1m') {
      tier = 'PRO_PLUS';
      codePrefix = 'PLUS';
      planTitle = 'OBD2 SCAN AI PRO+ на 1 месяц (Подписка на ИИ) 👑';
      durationDays = 30;
      if (isUsd) {
        amountValue = '3.00';
        currency = 'USD';
      } else {
        amountValue = '150.00';
        currency = 'RUB';
      }
    } else {
      tier = 'PRO';
      codePrefix = 'PRO1';
      planTitle = 'OBD2 SCAN AI PRO (Бессрочная лицензия ⭐)';
      if (isUsd) {
        amountValue = '10.00';
        currency = 'USD';
      } else {
        amountValue = '500.00';
        currency = 'RUB';
      }
    }

    if (!store.codes) store.codes = {};

    // Создаем новый код активации в базе
    const newCode = generateRandomCode(codePrefix);
    store.codes[newCode] = {
      isUsed: false,
      deviceId: null,
      devices: [],
      email: buyerEmail || null,
      tier: tier,
      isSubscription: isPlus,
      price: `${amountValue} ${currency}`,
      createdAt: Date.now()
    };

    const { shopId, secretKey } = getYooKassaCredentials();

    // Создаем сессию оплаты ЮKassa
    const authHeader = 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64');
    const idempotenceKey = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const yooResponse = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Idempotence-Key': idempotenceKey
      },
      body: JSON.stringify({
        amount: {
          value: amountValue,
          currency: currency
        },
        confirmation: {
          type: 'redirect',
          return_url: `https://obd2scanai.ru/buy?code=${newCode}&status=success&tier=${tier}`
        },
        capture: true,
        description: `Покупка ${planTitle} (Код: ${newCode})`
      })
    });

    const responseText = await yooResponse.text();
    let paymentData = {};
    try {
      paymentData = JSON.parse(responseText);
    } catch (e) {
      console.error('YooKassa non-JSON response:', responseText);
    }

    if (paymentData.confirmation && paymentData.confirmation.confirmation_url) {
      // Отправляем письмо с кодом
      const resend = getResend();
      if (resend && buyerEmail) {
        try {
          const subject = isPlus
            ? `Ваш код подписки OBD2 SCAN AI PRO+ (ИИ-Диагност): ${newCode}`
            : `Ваш код активации OBD2 SCAN AI PRO: ${newCode}`;

          await resend.emails.send({
            from: 'OBD2 SCAN AI <support@obd2scanai.ru>',
            to: buyerEmail,
            subject: subject,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px;">
                <h2 style="color: #10b981;">Спасибо за покупку ${planTitle}!</h2>
                <p>Ваш персональный код активации:</p>
                <div style="background: #0d1322; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 3px; text-align: center; color: #10b981; border-radius: 8px; margin: 20px 0;">
                  ${newCode}
                </div>
                <p>Откройте приложение <b>OBD2 SCAN AI</b> на вашем телефоне или планшете, перейдите в меню <b>«Активация PRO»</b> и вставьте этот код.</p>
                <p style="color: #666; font-size: 13px;">Поддерживаемые адаптеры: ELM327 Bluetooth, Wi-Fi и проводные USB-OTG.</p>
              </div>
            `
          });
        } catch (e) {
          console.error('Email send error:', e);
        }
      }

      return res.status(200).json({
        success: true,
        code: newCode,
        tier: tier,
        confirmationUrl: paymentData.confirmation.confirmation_url
      });
    } else {
      console.error('YooKassa error response:', paymentData);
      return res.status(400).json({
        success: false,
        error: paymentData.description || 'Не удалось создать платеж в ЮKassa. Проверьте ShopID и Секретный ключ.'
      });
    }
  } catch (error) {
    console.error('Pay endpoint error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
