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
    const { code, email, newDeviceId } = body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Введите корректный E-mail, указанный при покупке' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code ? code.trim().toUpperCase() : null;

    let targetCodeEntry = null;
    let foundCodeKey = cleanCode;

    // 🔍 СЦЕНАРИЙ 1: Восстановление ПО ОДНОМУ ЛИШЬ E-MAIL (если код был потерян!)
    if (!cleanCode) {
      // Ищем код в базе купленных кодов по E-mail
      for (const [k, entry] of Object.entries(store.codes)) {
        if (entry.email && entry.email.trim().toLowerCase() === cleanEmail) {
          targetCodeEntry = entry;
          foundCodeKey = k;
          break;
        }
      }

      // Если не нашли напрямую в store.codes, проверяем store.emails
      if (!targetCodeEntry && Array.isArray(store.emails)) {
        const userEmailRecord = store.emails.find(e => e.email === cleanEmail && e.code);
        if (userEmailRecord) {
          foundCodeKey = userEmailRecord.code;
          targetCodeEntry = store.codes[foundCodeKey] || { email: cleanEmail, isUsed: true };
          store.codes[foundCodeKey] = targetCodeEntry;
        }
      }

      if (!targetCodeEntry) {
        return res.status(404).json({
          success: false,
          error: `Покупка на E-mail ${cleanEmail} не найдена. Убедитесь, что вы указываете E-mail, введённый при оплате.`
        });
      }
    } else {
      // 🔍 СЦЕНАРИЙ 2: Перенос по коду и E-mail
      targetCodeEntry = store.codes[cleanCode];
      if (!targetCodeEntry) {
        // Авто-создаем для тестирования если код вида PRO...
        if (cleanCode.startsWith('PRO') || cleanCode.startsWith('TEST')) {
          targetCodeEntry = { isUsed: true, email: cleanEmail, devices: [] };
          store.codes[cleanCode] = targetCodeEntry;
        } else {
          return res.status(404).json({ success: false, error: 'Код активации не найден' });
        }
      }
    }

    // Инициализируем массив устройств (до 2 устройств: Телефон + Планшет в машине)
    if (!targetCodeEntry.devices) {
      targetCodeEntry.devices = targetCodeEntry.deviceId ? [targetCodeEntry.deviceId] : [];
    }

    if (newDeviceId && !targetCodeEntry.devices.includes(newDeviceId)) {
      if (targetCodeEntry.devices.length < 2) {
        targetCodeEntry.devices.push(newDeviceId);
      } else {
        targetCodeEntry.devices = [targetCodeEntry.devices[1], newDeviceId];
      }
    }

    targetCodeEntry.email = cleanEmail;
    targetCodeEntry.isUsed = true;
    targetCodeEntry.recoveredAt = Date.now();

    console.log(`[RECOVER SUCCESS] Code ${foundCodeKey} for email ${cleanEmail}, devices:`, targetCodeEntry.devices);

    return res.status(200).json({
      success: true,
      code: foundCodeKey,
      message: `Лицензия ${foundCodeKey} успешно найдена по E-mail и активирована на этом устройстве!`
    });
  } catch (error) {
    console.error('Recover error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

