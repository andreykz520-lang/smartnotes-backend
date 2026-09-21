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

module.exports = async (req, res) => {
  compatMiddleware(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { deviceId, code } = req.body || {};

    if (!deviceId && !code) {
      return res.status(400).json({ valid: false, error: 'deviceId or code is required' });
    }

    if (!store.codes) store.codes = {};

    const cleanCode = (code || '').trim().toUpperCase();
    let foundCodeKey = null;
    let foundEntry = null;

    if (cleanCode && store.codes[cleanCode]) {
      foundCodeKey = cleanCode;
      foundEntry = store.codes[cleanCode];
    } else if (deviceId) {
      const entry = Object.entries(store.codes).find(([k, c]) => {
        const hasDevice = (c.devices && Array.isArray(c.devices) && c.devices.includes(deviceId)) || (c.deviceId === deviceId);
        return hasDevice && c.isUsed;
      });
      if (entry) {
        foundCodeKey = entry[0];
        foundEntry = entry[1];
      }
    }

    if (foundCodeKey && foundEntry) {
      const isPlus = foundCodeKey.startsWith('PLUS') || 
                     foundCodeKey.startsWith('AI') || 
                     foundCodeKey.startsWith('SUB') || 
                     foundCodeKey.startsWith('PRO+') ||
                     (foundEntry.plan === 'plus');
      const tierType = isPlus ? 'PRO_PLUS' : 'PRO';
      return res.status(200).json({
        valid: true,
        isPro: true,
        type: tierType,
        code: foundCodeKey
      });
    }

    // Проверяем 7-дневный триал
    if (deviceId && store.deviceTrials) {
      const trial = store.deviceTrials[deviceId];
      if (trial) {
        if (Date.now() <= trial.expiry) {
          return res.status(200).json({
            valid: true,
            isPro: true,
            type: 'TRIAL',
            expiry: trial.expiry,
            code: trial.trialCode || `TRIAL-${trial.expiry}`
          });
        } else {
          return res.status(200).json({ valid: false, isPro: false, error: 'Пробный период истёк' });
        }
      }
    }

    return res.status(200).json({ valid: false, isPro: false });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ valid: false, error: error.message });
  }
};

