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
    const { email, deviceId } = body || {};

    if (!email || !email.includes('@') || !deviceId) {
      return res.status(400).json({ success: false, error: 'Укажите E-mail и ID устройства' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 🔒 ДВОЙНАЯ БЛОКИРОВКА #1: По ID устройства
    const previousDeviceTrial = store.deviceTrials[deviceId];
    if (previousDeviceTrial) {
      const formattedDate = new Date(previousDeviceTrial.activatedAt).toLocaleDateString('ru-RU');
      return res.status(403).json({
        success: false,
        error: `На данном смартфоне 7-дневный пробный период уже выдан (${formattedDate})`
      });
    }

    // 🔒 ДВОЙНАЯ БЛОКИРОВКА #2: По E-mail адресу
    if (!store.emailTrials) store.emailTrials = {};
    const previousEmailTrial = store.emailTrials[cleanEmail];
    if (previousEmailTrial) {
      const formattedDate = new Date(previousEmailTrial.activatedAt).toLocaleDateString('ru-RU');
      return res.status(403).json({
        success: false,
        error: `На E-mail ${cleanEmail} 7-дневный пробный период уже был выдан (${formattedDate})`
      });
    }

    // Запоминаем E-mail в админ-базе!
    store.emails.push({
      email: cleanEmail,
      date: new Date().toISOString(),
      type: 'TRIAL'
    });

    const trialCode = `TRIAL-${Math.floor(100000 + Math.random() * 900000)}`;

    store.deviceTrials[deviceId] = {
      email: cleanEmail,
      activatedAt: Date.now(),
      trialCode: trialCode
    };

    store.emailTrials[cleanEmail] = {
      deviceId: deviceId,
      activatedAt: Date.now(),
      trialCode: trialCode
    };

    return res.status(200).json({
      success: true,
      code: trialCode,
      message: '7-дневный пробный период успешно активирован!'
    });
  } catch (error) {
    console.error('Trial error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка сервера: ' + error.message });
  }
};

