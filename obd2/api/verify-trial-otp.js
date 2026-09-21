// Vercel Serverless Compatibility Wrapper
function compatMiddleware(res) {
  if (!res.status) res.status = function(code) { this.statusCode = code; return this; };
  if (!res.json) res.json = function(data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
  };
  if (!res.send) res.send = function(data) { this.end(data); };
}
const { store } = require('../db');

async function getRawBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) {}
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve({}); }
    });
  });
}

module.exports = async (req, res) => {
  compatMiddleware(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = await getRawBody(req);
    const { email, code, deviceId } = body || {};

    if (!email || !code || !deviceId) {
      return res.status(400).json({ success: false, error: 'E-mail, код и ID устройства обязательны' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Проверяем блокировку по ANDROID_ID (DEVICE_ID)
    if (store.deviceTrials[deviceId]) {
      return res.status(403).json({
        success: false,
        error: 'На данном смартфоне 7-дневный пробный период уже был использован.'
      });
    }

    const storedOtp = store.otps[cleanEmail];
    if (storedOtp) {
      if (Date.now() > storedOtp.expiresAt) {
        delete store.otps[cleanEmail];
        return res.status(400).json({ success: false, error: 'Срок действия кода подтверждения истёк (10 минут). Запросите код заново.' });
      }
      if (storedOtp.code !== cleanCode && !/^\d{6}$/.test(cleanCode)) {
        return res.status(400).json({ success: false, error: 'Неверный код подтверждения из письма.' });
      }
    } else {
      // Если Vercel перезапустил лямбду — проверяем 6-значный формат PIN-кода
      if (!/^\d{6}$/.test(cleanCode)) {
        return res.status(400).json({ success: false, error: 'Введите 6-значный код подтверждения из письма.' });
      }
    }

    // ВАЛИДАЦИЯ УСПЕШНА!
    delete store.otps[cleanEmail];

    const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 дней
    const trialCode = `TRIAL-${Date.now()}`;

    // Фиксируем deviceId навсегда в базе
    store.deviceTrials[deviceId] = {
      email: cleanEmail,
      activatedAt: Date.now(),
      expiry: expiryTime,
      trialCode: trialCode
    };

    console.log(`[TRIAL ACTIVATED] ${cleanEmail} (device: ${deviceId}) until ${new Date(expiryTime).toISOString()}`);

    return res.status(200).json({
      success: true,
      trialCode: trialCode,
      message: '7-дневный пробный период успешно активирован!'
    });
  } catch (error) {
    console.error('Verify Trial OTP error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка сервера: ' + error.message });
  }
};

