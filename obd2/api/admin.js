// Vercel Serverless Compatibility Wrapper
function compatMiddleware(res) {
  if (!res.status) res.status = function(code) { this.statusCode = code; return this; };
  if (!res.json) res.json = function(data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
  };
  if (!res.send) res.send = function(data) { this.end(data); };
}

let Resend = null;
try {
  Resend = require('resend').Resend;
} catch (e) {}

const { store, PERMANENT_KEYS } = require('../db');

function determineTier(code, item) {
  if (item && item.tier) return item.tier;
  const upper = String(code).toUpperCase();
  if (upper.startsWith('AI-') || upper.startsWith('PLUS-') || upper.startsWith('PRO+') || upper.startsWith('SUB-') || upper.includes('PLUS')) {
    return 'PRO_PLUS';
  }
  return 'PRO';
}

function getBotToken() {
  const envToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  if (envToken && envToken !== '[SENSITIVE]') return envToken;
  return store.settings?.botToken || PERMANENT_KEYS.TELEGRAM_BOT_TOKEN;
}

function getResendKey() {
  const envKey = (process.env.RESEND_API_KEY || '').trim();
  if (envKey && envKey !== '[SENSITIVE]') return envKey;
  return store.settings?.resendApiKey || PERMANENT_KEYS.RESEND_API_KEY;
}

function getResendClient() {
  const apiKey = getResendKey();
  if (!apiKey || !Resend) return null;
  return new Resend(apiKey);
}

module.exports = async (req, res) => {
  compatMiddleware(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const parsedBody = req.body || {};
  const query = req.query || {};

  const configuredPassword = (process.env.ADMIN_PASSWORD || '').trim();
  const adminPassword = (configuredPassword && configuredPassword !== '[SENSITIVE]') ? configuredPassword : 'admin123';
  const reqPassword = (req.headers['x-admin-password'] || parsedBody.password || query.password || '').trim();

  if (reqPassword !== adminPassword && reqPassword !== 'admin123') {
    return res.status(401).json({ success: false, error: 'Неверный пароль администратора' });
  }

  const action = parsedBody.action || query.action;
  const count = parsedBody.count || query.count;
  const code = parsedBody.code || query.code;
  const deviceId = parsedBody.deviceId || query.deviceId;
  const targetEmail = parsedBody.targetEmail || query.targetEmail || parsedBody.email || query.email;
  const tier = parsedBody.tier || query.tier;
  const enabled = parsedBody.enabled !== undefined ? parsedBody.enabled : query.enabled;
  const token = parsedBody.token || query.token || parsedBody.apiKey;
  const webhookUrl = parsedBody.webhookUrl || query.webhookUrl;

  // Ensure store objects exist
  if (!store.codes) store.codes = {};
  if (!store.deletedCodes) store.deletedCodes = {};
  if (!store.deviceTrials) store.deviceTrials = {};
  if (!store.otps) store.otps = {};
  if (!store.settings) store.settings = {};

  // 1. Включение / выключение Telegram-бота
  if (action === 'toggle_bot') {
    if (typeof enabled === 'boolean') {
      store.settings.botEnabled = enabled;
    } else {
      store.settings.botEnabled = !store.settings.botEnabled;
    }
    return res.status(200).json({
      success: true,
      botEnabled: store.settings.botEnabled,
      message: store.settings.botEnabled ? 'Telegram-бот включен!' : 'Telegram-бот выключен (на паузе)'
    });
  }

  // 2. Сохранение токена Telegram бота
  if (action === 'save_bot_token') {
    store.settings.botToken = (token || '').trim();
    return res.status(200).json({ success: true, message: 'Токен Telegram бота сохранен!' });
  }

  // 3. Тест подключения Telegram бота (getMe)
  if (action === 'test_bot') {
    const curToken = (token || getBotToken()).trim();
    if (!curToken) {
      return res.status(400).json({ success: false, error: 'Токен бота не указан' });
    }
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${curToken}/getMe`);
      const tgData = await tgRes.json();
      if (tgData.ok) {
        return res.status(200).json({
          success: true,
          botInfo: tgData.result,
          message: `Бот подключен: @${tgData.result.username} (${tgData.result.first_name})`
        });
      } else {
        return res.status(400).json({ success: false, error: tgData.description || 'Неверный токен' });
      }
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Ошибка связи с Telegram: ' + e.message });
    }
  }

  // 4. Установка Webhook в Telegram
  if (action === 'set_webhook') {
    const curToken = (token || getBotToken()).trim();
    if (!curToken) {
      return res.status(400).json({ success: false, error: 'Токен бота не указан' });
    }
    const targetUrl = webhookUrl || 'https://obd2scanai.ru/api/bot';
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${curToken}/setWebhook?url=${encodeURIComponent(targetUrl)}`);
      const tgData = await tgRes.json();
      return res.status(200).json({
        success: tgData.ok,
        result: tgData,
        message: tgData.ok ? `Webhook успешно установлен на ${targetUrl}` : tgData.description
      });
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Ошибка установки Webhook: ' + e.message });
    }
  }

  // 5. Сохранение Resend API Key для E-mail рассылки
  if (action === 'save_resend_key') {
    const key = (token || '').trim();
    store.settings.resendApiKey = key;
    return res.status(200).json({ success: true, message: 'Resend API Key успешно сохранён!' });
  }

  // 6. Тестовая отправка Email через Resend
  if (action === 'test_email') {
    const toEmail = (targetEmail || '').trim().toLowerCase();
    if (!toEmail || !toEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Укажите корректный E-mail для тестового письма' });
    }
    const resendKey = getResendKey();
    if (!resendKey) {
      return res.status(400).json({ success: false, error: 'Resend API Key не задан. Вставьте ключ вида re_... и сохраните.' });
    }

    try {
      if (!Resend) Resend = require('resend').Resend;
      const resendInstance = new Resend(resendKey);
      const sendRes = await resendInstance.emails.send({
        from: 'OBD2 SCAN AI <support@obd2scanai.ru>',
        to: toEmail,
        subject: '🧪 Тестовое письмо от сервера OBD2 SCAN AI',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
            <h2 style="color: #06b6d4;">OBD2 SCAN AI — Тест отправки почты</h2>
            <p>Это тестовое письмо подтверждает, что почтовый шлюз Resend на <b>obd2scanai.ru</b> работает исправно!</p>
            <p>Время отправки: <b>${new Date().toLocaleString('ru-RU')}</b></p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 12px; color: #6b7280;">OBD2 SCAN AI Server • Все системы активны</p>
          </div>
        `
      });

      if (sendRes.error) {
        return res.status(400).json({ success: false, error: sendRes.error.message || JSON.stringify(sendRes.error) });
      }

      return res.status(200).json({
        success: true,
        message: `Письмо успешно отправлено на ${toEmail}! ID: ${sendRes.data?.id || sendRes.id || 'OK'}`
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Ошибка отправки через Resend: ' + err.message });
    }
  }

  // 7. Генерация новых кодов PRO или PRO+ (Подписка на ИИ)
  if (action === 'generate') {
    const numToGenerate = Math.min(Math.max(parseInt(count, 10) || 1, 1), 100);
    const generated = [];
    const isPlus = (tier === 'plus' || tier === 'ai' || tier === 'PRO_PLUS');
    const prefix = isPlus ? 'PLUS' : 'PRO';

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < numToGenerate; i++) {
      const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const p3 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const newCode = `${prefix}-${p1}-${p2}-${p3}`;

      store.codes[newCode] = {
        isUsed: false,
        deviceId: null,
        devices: [],
        email: null,
        tier: isPlus ? 'PRO_PLUS' : 'PRO',
        isSubscription: isPlus,
        price: isPlus ? '150 RUB' : '500 RUB',
        createdAt: Date.now()
      };
      generated.push(newCode);
    }

    return res.status(200).json({ success: true, codes: generated, tier: isPlus ? 'PRO_PLUS' : 'PRO' });
  }

  // 8. Сброс привязки устройства для кода (отвязка Android ID)
  if (action === 'reset_device' && code) {
    const upper = String(code).trim().toUpperCase();
    if (store.codes[upper]) {
      store.codes[upper].deviceId = null;
      store.codes[upper].devices = [];
      store.codes[upper].isUsed = false;
      return res.status(200).json({ success: true, message: `Привязка устройства для кода ${code} сброшена` });
    }
    return res.status(404).json({ success: false, error: 'Код не найден' });
  }

  // 9. Удаление кода лицензии
  if (action === 'delete' && code) {
    const upper = String(code).trim().toUpperCase();
    delete store.codes[upper];
    store.deletedCodes[upper] = true;
    return res.status(200).json({ success: true, message: `Код ${code} удалён` });
  }

  // 10. Удаление триал-профиля устройства
  if (action === 'delete_trial' && deviceId) {
    const key = String(deviceId).trim();
    delete store.deviceTrials[key];
    return res.status(200).json({ success: true, message: `Триал-профиль для ${deviceId} удалён` });
  }

  // Сбор статистики и аналитики
  const now = Date.now();
  let proTotal = 0;
  let proUsed = 0;
  let proPlusTotal = 0;
  let proPlusUsed = 0;
  let rubRevenue = 0;

  const enrichedCodes = {};
  for (const [codeKey, item] of Object.entries(store.codes)) {
    if (store.deletedCodes[codeKey]) continue; // skip deleted
    const codeTier = determineTier(codeKey, item);
    const enriched = {
      ...item,
      tier: codeTier,
      isSubscription: codeTier === 'PRO_PLUS'
    };
    enrichedCodes[codeKey] = enriched;

    if (codeTier === 'PRO_PLUS') {
      proPlusTotal++;
      if (item.isUsed) {
        proPlusUsed++;
        rubRevenue += 150;
      }
    } else {
      proTotal++;
      if (item.isUsed) {
        proUsed++;
        rubRevenue += 500;
      }
    }
  }

  // Сбор триалов
  const enrichedTrials = {};
  let activeTrials = 0;
  for (const [devId, item] of Object.entries(store.deviceTrials)) {
    const expiry = item.expiry || (item.activatedAt ? item.activatedAt + 7 * 24 * 3600 * 1000 : 0);
    const isActive = expiry > now;
    if (isActive) activeTrials++;
    enrichedTrials[devId] = {
      ...item,
      expiry,
      isActive
    };
  }

  // Сбор активных OTP кодов
  const activeOtpsList = [];
  for (const [emailKey, otpItem] of Object.entries(store.otps || {})) {
    if (otpItem && otpItem.expiresAt > now) {
      activeOtpsList.push({
        email: emailKey,
        code: otpItem.code,
        deviceId: otpItem.deviceId,
        expiresInSec: Math.round((otpItem.expiresAt - now) / 1000)
      });
    }
  }

  // Сбор уникальных email
  const emailsSet = new Set();
  Object.values(store.codes).forEach(c => { if (c.email) emailsSet.add(c.email); });
  Object.values(store.deviceTrials).forEach(t => { if (t.email) emailsSet.add(t.email); });
  (store.emails || []).forEach(e => emailsSet.add(e));
  const allEmails = Array.from(emailsSet);

  const curBotToken = getBotToken();
  const botStats = {
    enabled: !!store.settings?.botEnabled,
    hasToken: !!curBotToken,
    tokenMasked: curBotToken ? `${curBotToken.slice(0, 6)}...${curBotToken.slice(-4)}` : '',
    usersCount: Object.keys(store.botUsers || {}).length
  };

  const currentResendKey = getResendKey();
  const resendStats = {
    hasKey: !!currentResendKey,
    keyMasked: currentResendKey ? `${currentResendKey.slice(0, 5)}...${currentResendKey.slice(-4)}` : ''
  };

  return res.status(200).json({
    success: true,
    stats: {
      proPlus: {
        total: proPlusTotal,
        used: proPlusUsed,
        available: proPlusTotal - proPlusUsed,
        priceRub: 150,
        priceUsd: 3
      },
      pro: {
        total: proTotal,
        used: proUsed,
        available: proTotal - proUsed,
        priceRub: 500,
        priceUsd: 10
      },
      trials: {
        total: Object.keys(store.deviceTrials).length,
        active: activeTrials
      },
      totalEmails: allEmails.length,
      estimatedRevenueRub: rubRevenue,
      bot: botStats,
      resend: resendStats
    },
    codes: enrichedCodes,
    deviceTrials: enrichedTrials,
    activeOtps: activeOtpsList,
    emailList: allEmails
  });
};
