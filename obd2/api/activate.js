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
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = await getRawBody(req);
    const { code, deviceId } = body || {};

    if (!code || !deviceId) {
      return res.status(400).json({ success: false, error: 'Код и ID устройства обязательны' });
    }

    const cleanCode = code.trim().toUpperCase();
    let existingCode = store.codes[cleanCode];

    // Если код не найден в базе — авто-создаем для демо/тестирования если код начинается с PRO, PLUS, AI, SUB или TEST
    if (!existingCode) {
      if (cleanCode.startsWith('PRO') || cleanCode.startsWith('TEST') || cleanCode.startsWith('PLUS') || cleanCode.startsWith('AI') || cleanCode.startsWith('SUB')) {
        existingCode = {
          isUsed: true,
          devices: [deviceId],
          activatedAt: Date.now()
        };
        store.codes[cleanCode] = existingCode;
        return res.status(200).json({
          success: true,
          message: 'Код успешно активирован!'
        });
      }
      return res.status(404).json({ success: false, error: 'Код активации не найден' });
    }

    // Убеждаемся что devices это массив (до 2 устройств на 1 покупку)
    if (!existingCode.devices) {
      existingCode.devices = existingCode.deviceId ? [existingCode.deviceId] : [];
    }

    // Если устройство УЖЕ в списке разрешенных для этого кода
    if (existingCode.devices.includes(deviceId)) {
      return res.status(200).json({
        success: true,
        restored: true,
        message: 'Лицензия подтверждена на вашем устройстве!'
      });
    }

    // Разрешаем до 2-х устройств на 1 PRO-покупку (например: Телефон + Планшет в машине)
    if (existingCode.devices.length < 2) {
      existingCode.devices.push(deviceId);
      existingCode.isUsed = true;
      return res.status(200).json({
        success: true,
        message: 'Код PRO успешно активирован на втором устройстве (Телефон + Планшет)!'
      });
    }

    // Если устройств уже >= 2 — привязываем новое устройство, замещая самое старое
    existingCode.devices = [existingCode.devices[1], deviceId];
    existingCode.isUsed = true;
    existingCode.lastTransferredAt = Date.now();

    return res.status(200).json({
      success: true,
      message: 'Лицензия PRO успешно перенесена на это устройство!'
    });
  } catch (error) {
    console.error('Activate error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка сервера: ' + error.message });
  }
};

