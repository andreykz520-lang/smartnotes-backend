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

function getResend() {
  if (!Resend) {
    try { Resend = require('resend').Resend; } catch (e) {}
  }
  const envKey = (process.env.RESEND_API_KEY || '').trim();
  const apiKey = (envKey && envKey !== '[SENSITIVE]') ? envKey : (store.settings?.resendApiKey || PERMANENT_KEYS.RESEND_API_KEY);
  if (!apiKey || !Resend) return null;
  return new Resend(apiKey);
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
    const body = req.body || {};
    const { email, deviceId } = body;

    if (!email || !email.includes('@') || !deviceId) {
      return res.status(400).json({ success: false, error: 'Укажите корректный E-mail и ID устройства' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 🛑 СТРОГАЯ ДВОЙНАЯ БЛОКИРОВКА (DEVICE_ID И EMAIL):
    if (!store.deviceTrials) store.deviceTrials = {};
    if (!store.emailTrials) store.emailTrials = {};
    if (!store.otps) store.otps = {};

    const previousDeviceTrial = store.deviceTrials[deviceId];
    if (previousDeviceTrial) {
      const formattedDate = new Date(previousDeviceTrial.activatedAt).toLocaleDateString('ru-RU');
      return res.status(403).json({
        success: false,
        error: `На данном смартфоне 7-дневный пробный период уже был активирован (${formattedDate}). Для продолжения работы приобретите полную версию PRO.`
      });
    }

    const previousEmailTrial = store.emailTrials[cleanEmail];
    if (previousEmailTrial) {
      const formattedDate = new Date(previousEmailTrial.activatedAt).toLocaleDateString('ru-RU');
      return res.status(403).json({
        success: false,
        error: `На E-mail ${cleanEmail} 7-дневный пробный период уже был активирован (${formattedDate}).`
      });
    }

    // Генерируем 6-значный случайный PIN-код
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Сохраняем OTP в память со сроком 10 минут
    store.otps[cleanEmail] = {
      code: otpCode,
      deviceId: deviceId,
      expiresAt: Date.now() + (10 * 60 * 1000)
    };

    console.log(`[TRIAL OTP] Created for ${cleanEmail} (device: ${deviceId}): ${otpCode}`);

    // Отправляем письмо с кодом через Resend
    const resend = getResend();
    let emailSent = false;
    let emailErr = null;

    if (resend) {
      try {
        const sendResult = await resend.emails.send({
          from: 'OBD2 SCAN AI <support@obd2scanai.ru>',
          to: cleanEmail,
          subject: `Код подтверждения OBD2 SCAN AI: ${otpCode}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #06b6d4;">Активация 7-дневного триала PRO</h2>
              <p>Ваш одноразовый код подтверждения для приложения <b>OBD2 SCAN AI</b>:</p>
              <div style="background: #f4f4f4; padding: 15px; font-size: 28px; font-weight: bold; letter-spacing: 5px; text-align: center; color: #111; border-radius: 8px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p>Код действителен в течение 10 минут.</p>
              <p>Если вы не запрашивали активацию — просто проигнорируйте это письмо.</p>
            </div>
          `
        });
        if (!sendResult.error) {
          emailSent = true;
          console.log(`[TRIAL OTP] Email sent successfully to ${cleanEmail}`);
        } else {
          emailErr = sendResult.error.message || JSON.stringify(sendResult.error);
          console.warn(`[TRIAL OTP] Resend API returned error:`, emailErr);
        }
      } catch (err) {
        emailErr = err.message;
        console.error(`[TRIAL OTP] Resend send exception:`, err);
      }
    } else {
      console.warn(`[TRIAL OTP] Resend is not configured (RESEND_API_KEY is missing or invalid)`);
    }

    return res.status(200).json({
      success: true,
      message: `Код подтверждения отправлен на ${cleanEmail}`,
      emailSent: emailSent,
      // Включаем devOtp для удобного тестирования если почтовый шлюз недоступен
      otpHint: otpCode
    });
  } catch (error) {
    console.error('Trial OTP error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка сервера: ' + error.message });
  }
};
