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

async function getRawBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk.toString('utf8'); });
    req.on('end', () => {
      if (!data || !data.trim()) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
    });
  });
}

function getBotToken() {
  const envToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  if (envToken && envToken !== '[SENSITIVE]') return envToken;
  return store.settings?.botToken || PERMANENT_KEYS.TELEGRAM_BOT_TOKEN;
}

function getYooKassaCredentials() {
  const envShopId = (process.env.YOOKASSA_SHOP_ID || '').trim();
  const envSecretKey = (process.env.YOOKASSA_SECRET_KEY || '').trim();
  
  const storeShopId = (store.settings?.yookassaShopId || '').trim();
  const storeSecretKey = (store.settings?.yookassaSecretKey || '').trim();

  const shopId = storeShopId || (envShopId && envShopId !== '[SENSITIVE]' ? envShopId : '');
  const secretKey = storeSecretKey || (envSecretKey && envSecretKey !== '[SENSITIVE]' ? envSecretKey : '');

  return { shopId, secretKey };
}

async function tgApi(method, payload) {
  const token = getBotToken();
  if (!token) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (e) {
    console.error('Telegram API error:', e);
    return null;
  }
}

function generateCode(prefix = 'PRO1') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const p3 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${p1}-${p2}-${p3}`;
}

async function createYooKassaPayment(amount, description, code, email) {
  const { shopId, secretKey } = getYooKassaCredentials();
  const authHeader = 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64');
  const idempotenceKey = `tg-pay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const isPlus = code.startsWith('PLUS');

  try {
    const yooRes = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Idempotence-Key': idempotenceKey
      },
      body: JSON.stringify({
        amount: { value: amount, currency: 'RUB' },
        confirmation: {
          type: 'redirect',
          return_url: `https://obd2scanai.ru/buy?code=${code}&status=success&tier=${isPlus ? 'PRO_PLUS' : 'PRO'}`
        },
        capture: true,
        description: description
      })
    });
    const data = await yooRes.json();
    if (data.confirmation && data.confirmation.confirmation_url) {
      return data.confirmation.confirmation_url;
    }
  } catch (e) {
    console.error('YooKassa in bot error:', e);
  }
  return `https://obd2scanai.ru/buy?plan=${isPlus ? 'plus' : 'pro'}&code=${code}`;
}

async function sendEmailReceipt(email, code, planTitle) {
  const resendApiKey = process.env.RESEND_API_KEY || store.settings?.resendApiKey;
  if (!resendApiKey || !Resend || !email) return;

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: 'OBD2 SCAN AI <support@obd2scanai.ru>',
      to: email,
      subject: `Ваш код активации ${planTitle}: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px;">
          <h2 style="color: #10b981;">Спасибо за покупку ${planTitle}!</h2>
          <p>Ваш персональный код активации из Telegram-бота:</p>
          <div style="background: #0d1322; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 3px; text-align: center; color: #10b981; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p>Откройте приложение <b>OBD2 SCAN AI</b> ➔ перейдите в меню <b>«Активация PRO»</b> ➔ вставьте этот код.</p>
          <p style="color: #666; font-size: 13px;">Поддерживаемые сканеры: Bluetooth, Wi-Fi и проводные USB-OTG (FTDI, CH340, CP2102).</p>
        </div>
      `
    });
  } catch (e) {
    console.error('Bot Resend error:', e);
  }
}

// Отправка Telegram Stars счета для иностранцев
async function sendStarsInvoice(chatId, title, description, payload, starsAmount) {
  return await tgApi('sendInvoice', {
    chat_id: chatId,
    title: title,
    description: description,
    payload: payload,
    currency: 'XTR', // Telegram Stars currency
    prices: [{ label: title, amount: starsAmount }],
    provider_token: '' // Empty for Telegram Stars
  });
}

async function handleBuyPro(chatId, userState) {
  const userEmail = userState.email;
  const newCode = generateCode('PRO1');
  if (!store.codes) store.codes = {};
  store.codes[newCode] = {
    isUsed: false,
    deviceId: null,
    devices: [],
    email: userEmail || null,
    tier: 'PRO',
    isSubscription: false,
    price: '500 RUB / $10 USD',
    fromTelegram: chatId,
    createdAt: Date.now()
  };
  userState.lastCode = newCode;

  const isEn = (userState.lang === 'en');
  const payUrlRub = await createYooKassaPayment('500.00', `OBD2 SCAN AI PRO (Код: ${newCode})`, newCode, userEmail);

  if (isEn) {
    await tgApi('sendMessage', {
      chat_id: chatId,
      text: `🏆 <b>OBD2 SCAN AI PRO (Lifetime License)</b>\n\n` +
            `✅ Permanent license — one-time payment forever\n` +
            `✅ Supports <b>Bluetooth, Wi-Fi & USB-OTG cables</b>\n` +
            `✅ Full ECU/ABS/SRS Diagnostics & Error Reset\n` +
            `✅ Real Odometer & Engine Hours Audit\n` +
            `✅ Unlimited AI Diagnostics (bring your own API key)\n\n` +
            `🔑 <b>Your activation code:</b> <code>${newCode}</code>\n\n` +
            `<b>Choose your payment method:</b>\n` +
            `• <b>⭐ Telegram Stars ($10 USD / 500 ⭐)</b> — Instant in-app payment with Apple Pay / Google Pay / Foreign cards.\n` +
            `• <b>💳 Bank Card / SBP (500 ₽)</b> — for CIS & Russian cards.`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '⭐ Pay with Telegram Stars (500 ⭐ / $10)', callback_data: `stars_pro_${newCode}` }],
          [{ text: '💳 Pay with Card / SBP (500 ₽)', url: payUrlRub }],
          [{ text: '📧 Bind / Change E-mail', callback_data: 'ask_email' }],
          [{ text: '◀️ Main Menu', callback_data: 'menu' }]
        ]
      }
    });
  } else {
    await tgApi('sendMessage', {
      chat_id: chatId,
      text: `🏆 <b>Тариф: PRO Навсегда (500 ₽ / $10 USD)</b>\n\n` +
            `✅ Бессрочная лицензия без ежемесячных платежей\n` +
            `✅ Подключение по <b>Bluetooth, Wi-Fi и проводному USB-OTG</b>\n` +
            `✅ Чтение и сброс ошибок всех блоков (ECU, АКПП, ABS, SRS)\n` +
            `✅ Проверка реального одометра и моточасов\n` +
            `✅ ИИ-Диагност (свой API ключ — безлимитно)\n\n` +
            `🔑 <b>Ваш персональный код:</b> <code>${newCode}</code>\n\n` +
            `<b>Выберите способ оплаты:</b>\n` +
            `• <b>💳 Карты РФ / СБП (500 ₽)</b> — через ЮKassa (Сбер, Т-Банк, МИР).\n` +
            `• <b>⭐ Зарубежные карты / Telegram Stars ($10 / 500 ⭐)</b> — для иностранцев через Apple Pay / Google Pay / Visa / MC.`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💳 Оплатить 500 ₽ (Карты РФ / СБП / ЮKassa)', url: payUrlRub }],
          [{ text: '⭐ Оплатить из-за рубежа (Telegram Stars / $10)', callback_data: `stars_pro_${newCode}` }],
          [{ text: '📧 Привязать / Изменить E-mail', callback_data: 'ask_email' }],
          [{ text: '◀️ В главное меню', callback_data: 'menu' }]
        ]
      }
    });
  }
}

async function handleBuyPlus(chatId, userState) {
  const userEmail = userState.email;
  const newCode = generateCode('PLUS');
  if (!store.codes) store.codes = {};
  store.codes[newCode] = {
    isUsed: false,
    deviceId: null,
    devices: [],
    email: userEmail || null,
    tier: 'PRO_PLUS',
    isSubscription: true,
    price: '150 RUB / $3 USD',
    fromTelegram: chatId,
    createdAt: Date.now()
  };
  userState.lastCode = newCode;

  const isEn = (userState.lang === 'en');
  const payUrlRub = await createYooKassaPayment('150.00', `OBD2 SCAN AI PRO+ ИИ (Код: ${newCode})`, newCode, userEmail);

  if (isEn) {
    await tgApi('sendMessage', {
      chat_id: chatId,
      text: `💎 <b>OBD2 SCAN AI PRO+ (AI Subscription)</b>\n\n` +
            `✅ All features of PRO version included\n` +
            `✅ <b>Unlimited AI requests to Gemini AI & GigaChat</b>\n` +
            `✅ Step-by-step repair guides & symptom breakdown\n` +
            `✅ Smart OEM spare parts search by AI\n` +
            `✅ Works over Bluetooth, Wi-Fi & USB-OTG\n\n` +
            `🔑 <b>Your activation code:</b> <code>${newCode}</code>\n\n` +
            `<b>Choose your payment method:</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '⭐ Pay with Telegram Stars (150 ⭐ / $3)', callback_data: `stars_plus_${newCode}` }],
          [{ text: '💳 Pay with Card / SBP (150 ₽)', url: payUrlRub }],
          [{ text: '📧 Bind / Change E-mail', callback_data: 'ask_email' }],
          [{ text: '◀️ Main Menu', callback_data: 'menu' }]
        ]
      }
    });
  } else {
    await tgApi('sendMessage', {
      chat_id: chatId,
      text: `💎 <b>Тариф: Подписка ИИ PRO+ (150 ₽ / $3 в мес)</b>\n\n` +
            `✅ Все возможности версии PRO\n` +
            `✅ <b>Безлимитные нейросетевые запросы к Gemini AI и GigaChat</b>\n` +
            `✅ Пошаговые схемы ремонта и детальный разбор симптомов\n` +
            `✅ Помощь ИИ в подборе оригинальных запчастей\n` +
            `✅ Поддержка Bluetooth, Wi-Fi и USB-OTG\n\n` +
            `🔑 <b>Ваш персональный код:</b> <code>${newCode}</code>\n\n` +
            `<b>Выберите способ оплаты:</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💳 Оформить подписку 150 ₽ (Карты РФ / СБП)', url: payUrlRub }],
          [{ text: '⭐ Оплатить из-за рубежа (Telegram Stars / $3)', callback_data: `stars_plus_${newCode}` }],
          [{ text: '📧 Привязать / Изменить E-mail', callback_data: 'ask_email' }],
          [{ text: '◀️ В главное меню', callback_data: 'menu' }]
        ]
      }
    });
  }
}

module.exports = async (req, res) => {
  compatMiddleware(res);
  if (req.method === 'GET') {
    const token = getBotToken();
    const isEnabled = (store.settings?.botEnabled !== false);
    return res.status(200).json({
      status: 'ok',
      botConfigured: !!token,
      botEnabled: isEnabled,
      service: 'OBD2 SCAN AI International Telegram Bot'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = await getRawBody(req);
    const token = getBotToken();

    if (!token) {
      return res.status(200).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
    }

    // 1. ОБРАБОТКА ПРЕДОПЛАТЫ TELEGRAM STARS (Pre-checkout query)
    if (update.pre_checkout_query) {
      const pcqId = update.pre_checkout_query.id;
      await tgApi('answerPreCheckoutQuery', {
        pre_checkout_query_id: pcqId,
        ok: true
      });
      return res.status(200).json({ ok: true });
    }

    const message = update.message;
    const callbackQuery = update.callback_query;

    const chatId = message?.chat?.id || callbackQuery?.message?.chat?.id;
    const fromUser = message?.from || callbackQuery?.from || {};
    const text = (message?.text || '').trim();

    if (!chatId) {
      return res.status(200).json({ ok: true });
    }

    if (!store.botUsers) store.botUsers = {};
    if (!store.botUsers[chatId]) {
      store.botUsers[chatId] = {
        userId: fromUser.id,
        username: fromUser.username || fromUser.first_name || '',
        email: null,
        lastCode: null,
        lang: (fromUser.language_code === 'ru' || fromUser.language_code === 'uk' || fromUser.language_code === 'be') ? 'ru' : 'en',
        state: null,
        joinedAt: Date.now()
      };
    }
    const userState = store.botUsers[chatId];

    // 2. ОБРАБОТКА УСПЕШНОЙ ОПЛАТЫ ЧЕРЕЗ TELEGRAM STARS
    if (message?.successful_payment) {
      const sp = message.successful_payment;
      const payload = sp.invoice_payload || '';
      let code = userState.lastCode;
      
      if (payload.startsWith('stars_pro_')) code = payload.replace('stars_pro_', '');
      if (payload.startsWith('stars_plus_')) code = payload.replace('stars_plus_', '');

      if (code && store.codes?.[code]) {
        store.codes[code].paid = true;
        store.codes[code].paidVia = 'TELEGRAM_STARS';
        store.codes[code].stars = sp.total_amount;
      }

      if (userState.email && code) {
        await sendEmailReceipt(userState.email, code, 'OBD2 SCAN AI (Telegram Stars)');
      }

      await tgApi('sendMessage', {
        chat_id: chatId,
        text: `🎉 <b>Payment Successful! / Оплата прошла успешно!</b>\n\n` +
              `⭐ Received: ${sp.total_amount} Telegram Stars\n\n` +
              `🔑 <b>Your Activation Code / Ваш код:</b>\n` +
              `<code>${code}</code>\n\n` +
              `📲 Open OBD2 SCAN AI app ➔ Menu ➔ <b>Activate PRO</b> ➔ paste your code!`,
        parse_mode: 'HTML',
        reply_markup: getMainKeyboard(userState)
      });
      return res.status(200).json({ ok: true });
    }

    // 3. ОБРАБОТКА НАЖАТИЙ НА КНОПКИ (Callback Query)
    if (callbackQuery) {
      const data = callbackQuery.data;
      await tgApi('answerCallbackQuery', { callback_query_id: callbackQuery.id });

      if (data === 'menu') {
        userState.state = null;
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: userState.lang === 'en' ? `🚗 <b>OBD2 SCAN AI Main Menu</b>\n\nSelect an option:` : `🚗 <b>Главное меню OBD2 SCAN AI</b>\n\nВыберите действие:`,
          parse_mode: 'HTML',
          reply_markup: getMainKeyboard(userState)
        });
        return res.status(200).json({ ok: true });
      }

      if (data === 'lang_ru') {
        userState.lang = 'ru';
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: `🇷🇺 Язык переключен на <b>Русский</b>.`,
          parse_mode: 'HTML',
          reply_markup: getMainKeyboard(userState)
        });
        return res.status(200).json({ ok: true });
      }

      if (data === 'lang_en') {
        userState.lang = 'en';
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: `🇬🇧 Language switched to <b>English</b>.`,
          parse_mode: 'HTML',
          reply_markup: getMainKeyboard(userState)
        });
        return res.status(200).json({ ok: true });
      }

      if (data === 'buy_pro') {
        await handleBuyPro(chatId, userState);
        return res.status(200).json({ ok: true });
      }

      if (data === 'buy_plus') {
        await handleBuyPlus(chatId, userState);
        return res.status(200).json({ ok: true });
      }

      if (data.startsWith('stars_pro_')) {
        const code = data.replace('stars_pro_', '');
        await sendStarsInvoice(
          chatId,
          'OBD2 SCAN AI PRO (Lifetime)',
          `Lifetime activation license for OBD2 SCAN AI app (Code: ${code}). Works worldwide with ELM327 Bluetooth, Wi-Fi & USB-OTG.`,
          `stars_pro_${code}`,
          500 // 500 Telegram Stars ($10 USD)
        );
        return res.status(200).json({ ok: true });
      }

      if (data.startsWith('stars_plus_')) {
        const code = data.replace('stars_plus_', '');
        await sendStarsInvoice(
          chatId,
          'OBD2 SCAN AI PRO+ (AI 1 Month)',
          `1 month neural network token pack (Gemini & GigaChat) for OBD2 SCAN AI (Code: ${code}).`,
          `stars_plus_${code}`,
          150 // 150 Telegram Stars ($3 USD)
        );
        return res.status(200).json({ ok: true });
      }

      if (data === 'help') {
        const helpText = userState.lang === 'en'
          ? `❓ <b>Supported Adapters & Connection:</b>\n\n` +
            `1. <b>Bluetooth</b>: ELM327 v1.5 (v2.1 not recommended due to limited chips).\n` +
            `2. <b>Wi-Fi</b>: Any ELM327 Wi-Fi scanner (default port 35000).\n` +
            `3. <b>USB-OTG (Wired)</b>: FTDI FT232, CH340, CP2102, PL2303 via Type-C/Micro-USB OTG cable.\n\n` +
            `📲 <b>How to activate:</b>\n` +
            `Open OBD2 SCAN AI app ➔ Menu ➔ <b>Activate PRO</b> ➔ paste your code!`
          : `❓ <b>Поддерживаемые адаптеры и подключение:</b>\n\n` +
            `1. <b>Bluetooth</b>: ELM327 версии 1.5 (v2.1 не рекомендуется из-за урезанных чипов).\n` +
            `2. <b>Wi-Fi</b>: любые ELM327 Wi-Fi сканеры (порт 35000).\n` +
            `3. <b>USB-OTG (проводное)</b>: адаптеры на чипах FTDI FT232, CH340, CP2102 через обычный переходник Type-C / Micro-USB в телефон.\n\n` +
            `📲 <b>Как активировать код:</b>\n` +
            `Откройте приложение ➔ Меню ➔ <b>«Активация PRO»</b> ➔ вставьте полученный код!`;

        await tgApi('sendMessage', {
          chat_id: chatId,
          text: helpText,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Official Website', url: 'https://obd2scanai.ru' }],
              [{ text: userState.lang === 'en' ? '◀️ Main Menu' : '◀️ В главное меню', callback_data: 'menu' }]
            ]
          }
        });
        return res.status(200).json({ ok: true });
      }

      if (data === 'ask_email') {
        userState.state = 'waiting_email';
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: userState.lang === 'en'
            ? `📧 <b>Link your E-mail:</b>\n\nReply with your email address (e.g. <code>user@example.com</code>).\n\nActivation keys and receipts will be automatically sent to this email.`
            : `📧 <b>Привязка E-mail адреса:</b>\n\nНапишите в ответном сообщении ваш e-mail (например: <code>user@mail.ru</code>).\n\nНа него будут автоматически дублироваться чеки, коды активации и инструкция.`,
          parse_mode: 'HTML'
        });
        return res.status(200).json({ ok: true });
      }
    }

    // 4. ОБРАБОТКА ТЕКСТОВЫХ СООБЩЕНИЙ
    if (userState.state === 'waiting_email' && text.includes('@')) {
      const email = text.trim().toLowerCase();
      userState.email = email;
      userState.state = null;

      if (!store.emails) store.emails = [];
      if (!store.emails.some(e => e.email === email)) {
        store.emails.push({ email: email, date: new Date().toISOString(), type: 'TELEGRAM_BOT' });
      }

      if (userState.lastCode) {
        await sendEmailReceipt(email, userState.lastCode, 'OBD2 SCAN AI');
      }

      await tgApi('sendMessage', {
        chat_id: chatId,
        text: userState.lang === 'en'
          ? `✅ <b>E-mail ${email} successfully linked!</b>\n\nAll your receipts and licenses will be sent to this address.`
          : `✅ <b>E-mail ${email} успешно привязан!</b>\n\nВсе ваши лицензии и чеки будут автоматически отправляться на этот адрес.`,
        parse_mode: 'HTML',
        reply_markup: getMainKeyboard(userState)
      });
      return res.status(200).json({ ok: true });
    }

    // Проверка глубоких ссылок из сайта: /start buy_pro или /start buy_plus
    if (text.startsWith('/start buy_pro') || text === '/buy_pro') {
      await handleBuyPro(chatId, userState);
      return res.status(200).json({ ok: true });
    }

    if (text.startsWith('/start buy_plus') || text === '/buy_plus') {
      await handleBuyPlus(chatId, userState);
      return res.status(200).json({ ok: true });
    }

    // Стандартное приветствие /start
    userState.state = null;
    const isEn = (userState.lang === 'en');
    const emailInfo = userState.email
      ? (isEn ? `📧 Linked E-mail: <code>${userState.email}</code>` : `📧 Привязанный E-mail: <code>${userState.email}</code>`)
      : (isEn ? `💡 <i>Tip: Link your email to receive license backup copies</i>` : `💡 <i>Совет: привяжите E-mail для получения копий лицензий</i>`);

    const welcomeText = isEn
      ? `👋 <b>Welcome to OBD2 SCAN AI Official Bot!</b>\n\n` +
        `🚗 Professional Car Diagnostics with AI (Gemini & GigaChat).\n` +
        `🔌 Supports <b>Bluetooth, Wi-Fi and USB-OTG</b> ELM327 scanners.\n` +
        `🌍 <b>Worldwide International Payments</b> supported (Telegram Stars / Apple Pay / Google Pay / Cards).\n\n` +
        `${emailInfo}\n\n` +
        `Select an option below:`
      : `👋 <b>Добро пожаловать в официальный бот OBD2 SCAN AI!</b>\n\n` +
        `🚗 Профессиональная диагностика автомобилей с ИИ (Gemini & GigaChat).\n` +
        `🔌 Поддержка <b>Bluetooth, Wi-Fi и USB-OTG</b> сканеров.\n` +
        `🌍 <b>Международная оплата для любых стран</b> (Telegram Stars / Apple Pay / Google Pay / Карты РФ и СНГ).\n\n` +
        `${emailInfo}\n\n` +
        `Выберите действие в меню ниже:`;

    await tgApi('sendMessage', {
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'HTML',
      reply_markup: getMainKeyboard(userState)
    });

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Bot webhook error:', error);
    return res.status(200).json({ ok: false, error: error.message });
  }
};

function getMainKeyboard(userState) {
  const isEn = (userState?.lang === 'en');
  const emailBtnText = userState?.email
    ? (isEn ? `📧 E-mail: ${userState.email}` : `📧 E-mail: ${userState.email}`)
    : (isEn ? `📧 Link E-mail` : `📧 Привязать E-mail`);

  const langBtn = isEn
    ? { text: '🇷🇺 Переключить на Русский', callback_data: 'lang_ru' }
    : { text: '🇬🇧 Switch to English', callback_data: 'lang_en' };

  if (isEn) {
    return {
      inline_keyboard: [
        [{ text: '📲 Download App (APK / Android)', url: 'https://obd2scanai.ru/download' }],
        [{ text: '🏆 Buy PRO Lifetime ($10 USD / 500 ⭐)', callback_data: 'buy_pro' }],
        [{ text: '💎 AI Subscription PRO+ ($3 USD / 150 ⭐)', callback_data: 'buy_plus' }],
        [{ text: emailBtnText, callback_data: 'ask_email' }],
        [
          { text: '❓ Adapters Info', callback_data: 'help' },
          { text: '🌐 Website', url: 'https://obd2scanai.ru' }
        ],
        [langBtn]
      ]
    };
  }

  return {
    inline_keyboard: [
      [{ text: '📲 Скачать приложение APK (Android)', url: 'https://obd2scanai.ru/download' }],
      [{ text: '🏆 Купить PRO Навсегда (500 ₽ / $10)', callback_data: 'buy_pro' }],
      [{ text: '💎 Подписка ИИ PRO+ (150 ₽ / $3)', callback_data: 'buy_plus' }],
      [{ text: emailBtnText, callback_data: 'ask_email' }],
      [
        { text: '❓ Адаптеры (USB/BT)', callback_data: 'help' },
        { text: '🌐 Сайт obd2scanai.ru', url: 'https://obd2scanai.ru' }
      ],
      [langBtn]
    ]
  };
}
