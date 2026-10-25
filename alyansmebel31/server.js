const fs = require('fs');
const path = require('path');
const http = require('http');
const nodemailer = require('nodemailer');

const LINK_HEADERS = '</.well-known/api-catalog>; rel="api-catalog", </.well-known/ai-catalog.json>; rel="service-desc", </llms.txt>; rel="service-doc", </llms.txt>; rel="describedby", </auth.md>; rel="authorizing-agent", </.well-known/oauth-authorization-server>; rel="oauth-authorization-server", </.well-known/oauth-protected-resource>; rel="oauth-protected-resource"';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4'
};

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const CUSTOM_SOUND_FILE = path.join(DATA_DIR, 'custom-alert.mp3');

const ADMIN_PASSWORD = process.env.ALYANS_ADMIN_PASSWORD || 'admin2026';
const NOTIFICATION_EMAIL = 'Inkort3@mail.ru';

// Nodemailer Transports (Port 465 SSL primary, Port 587 STARTTLS fallback)
const transporter465 = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: 'andrey.chemarev@yandex.ru',
    pass: 'rlxuqqlzylxozvwu'
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000,
  tls: { rejectUnauthorized: false }
});

const transporter587 = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 587,
  secure: false,
  auth: {
    user: 'andrey.chemarev@yandex.ru',
    pass: 'rlxuqqlzylxozvwu'
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000,
  tls: { rejectUnauthorized: false }
});

async function sendLeadEmail(lead) {
  const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
  const nowMoscow = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  const timeMoscow = new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });

  const mailOptions = {
    from: '"Альянс Мебель Белгород" <andrey.chemarev@yandex.ru>',
    to: NOTIFICATION_EMAIL,
    subject: `[${timeMoscow}] Новая заявка: ${lead.phone} • ${lead.name || 'Клиент'} (${lead.category || 'Консультация'})`,
    text: `Новая заявка с сайта https://alyansmebel31.ru (ул. Благодатная, 80):\n\nТелефон: ${lead.phone} (${cleanPhone})\nИмя: ${lead.name || 'Не указано'}\nКатегория / Интерес: ${lead.category || 'Консультация'}\nКомментарий: ${lead.comment || '—'}\nВремя: ${nowMoscow}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0b0e14; color: #ffffff; padding: 22px; border-radius: 14px; max-width: 550px; border: 2px solid #d97706; box-sizing: border-box;">
        <h2 style="color: #f59e0b; margin-top: 0; margin-bottom: 6px; font-size: 22px;">🛋️ Новая заявка на мебель!</h2>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 0; margin-bottom: 18px;">Салон «Альянс Мебель» • Белгород, ул. Благодатная, 80 (1 этаж)</p>
        
        <div style="background-color: #161922; border: 1px solid #262b36; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; font-size: 16px;">
            <strong style="color: #9ca3af;">👤 Имя:</strong> <span style="color: #ffffff; font-weight: bold;">${lead.name || 'Не указано'}</span>
          </p>
          <p style="margin: 0 0 10px 0; font-size: 18px;">
            <strong style="color: #9ca3af;">📞 Телефон:</strong> <a href="tel:${cleanPhone}" style="color: #f59e0b; font-weight: bold; text-decoration: none;">${lead.phone}</a>
          </p>
          <p style="margin: 0 0 10px 0; font-size: 15px;">
            <strong style="color: #9ca3af;">🏷️ Категория:</strong> <span style="color: #60a5fa; font-weight: bold;">${lead.category || 'Консультация по мебели'}</span>
          </p>
          ${lead.comment ? `<p style="margin: 0 0 10px 0; font-size: 14px; color: #d1d5db;"><strong style="color: #9ca3af;">💬 Пожелания:</strong> ${lead.comment}</p>` : ''}
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            <strong>📅 Время заявки:</strong> ${nowMoscow}
          </p>
        </div>

        <p style="margin: 0 0 14px 0; text-align: center;">
          <a href="tel:${cleanPhone}" style="display: block; background-color: #10b981; color: #ffffff !important; font-weight: 900; padding: 16px 20px; border-radius: 12px; text-decoration: none; font-size: 18px; text-align: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
            📞 ПОЗВОНИТЬ КЛИЕНТУ
          </a>
        </p>

        <p style="font-size: 11px; color: #6b7280; text-align: center; margin: 0;">
          Альянс Мебель • Официальный партнер «Пинскдрев» в Белгороде
        </p>
      </div>
    `
  };

  try {
    const info = await transporter465.sendMail(mailOptions);
    console.log('[Alyans Email 465] Sent to ' + NOTIFICATION_EMAIL + ':', info.messageId);
    return info;
  } catch (err465) {
    console.warn('[Alyans Email 465 failed, trying 587]:', err465.message);
    const info = await transporter587.sendMail(mailOptions);
    console.log('[Alyans Email 587] Sent to ' + NOTIFICATION_EMAIL + ':', info.messageId);
    return info;
  }
}

// Data persistence helpers
function getLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('[Leads Read Error]:', e);
  }
  return [];
}

function saveLeadsList(leads) {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Leads Save Error]:', e);
  }
}

function addLead(lead) {
  const leads = getLeads();
  const newLead = {
    id: 'lead_' + Date.now().toString(36),
    createdAt: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
    ...lead
  };
  leads.unshift(newLead);
  saveLeadsList(leads);

  // Update stats
  try {
    const stats = getStats();
    stats.formSubmits = (stats.formSubmits || 0) + 1;
    const dateKey = new Date().toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
    if (!stats.daily) stats.daily = {};
    if (!stats.daily[dateKey]) {
      stats.daily[dateKey] = { visits: 0, phoneClicks: 0, formSubmits: 0 };
    }
    stats.daily[dateKey].formSubmits = (stats.daily[dateKey].formSubmits || 0) + 1;
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (err) {}

  return newLead;
}

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { ringtone: 'bell', customSoundUrl: '' };
}

function saveSettings(newSettings) {
  try {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (e) {
    return { ringtone: 'bell', customSoundUrl: '', ...newSettings };
  }
}

function getStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
      const now = new Date();
      const dateKey = now.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
      const todayData = (stats.daily && stats.daily[dateKey]) ? stats.daily[dateKey] : { visits: 0, phoneClicks: 0, formSubmits: 0 };
      
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todayVisitsCount = Array.isArray(stats.visits)
        ? stats.visits.filter(v => v.timestamp && v.timestamp >= startOfDay).length
        : (todayData.visits || 0);

      return {
        ...stats,
        totalVisits: stats.totalVisits || 0,
        todayVisits: todayVisitsCount,
        phoneClicks: stats.phoneClicks || 0,
        todayPhoneClicks: todayData.phoneClicks || 0,
        formSubmits: stats.formSubmits || 0,
        todayFormSubmits: todayData.formSubmits || 0,
        visits: Array.isArray(stats.visits) ? stats.visits : []
      };
    }
  } catch (e) {}
  return { totalVisits: 0, todayVisits: 0, phoneClicks: 0, todayPhoneClicks: 0, formSubmits: 0, todayFormSubmits: 0, daily: {}, visits: [] };
}

const geoCache = {};
function resolveIpGeo(ip) {
  if (!ip || ip === '—' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return Promise.resolve({ country: 'Россия', countryCode: 'RU', city: 'Белгород', org: 'РФ' });
  }
  if (geoCache[ip]) {
    return Promise.resolve(geoCache[ip]);
  }
  return new Promise((resolve) => {
    const req = http.get(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,org`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'success') {
            const geo = {
              country: json.country || 'Неизвестно',
              countryCode: (json.countryCode || '').toUpperCase(),
              city: json.city || '',
              org: json.org || ''
            };
            geoCache[ip] = geo;
            return resolve(geo);
          }
        } catch (e) {}
        resolve({ country: 'Неизвестно', countryCode: '', city: '', org: '' });
      });
    });
    req.on('error', () => resolve({ country: 'Неизвестно', countryCode: '', city: '', org: '' }));
    req.setTimeout(2500, () => { req.destroy(); resolve({ country: 'Неизвестно', countryCode: '', city: '', org: '' }); });
  });
}

async function recordVisit(req) {
  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || '';
    if (ua.includes('Uptime') || ua.includes('HealthCheck') || ua.includes('monitoring')) return;

    const stats = getStats();
    stats.totalVisits = (stats.totalVisits || 0) + 1;

    const now = new Date();
    const dateKey = now.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
    if (!stats.daily) stats.daily = {};
    if (!stats.daily[dateKey]) {
      stats.daily[dateKey] = { visits: 0, phoneClicks: 0, formSubmits: 0 };
    }
    stats.daily[dateKey].visits = (stats.daily[dateKey].visits || 0) + 1;

    const geo = await resolveIpGeo(ip);
    if (!Array.isArray(stats.visits)) stats.visits = [];
    stats.visits.unshift({
      timestamp: Date.now(),
      time: now.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' }),
      date: dateKey,
      ip,
      country: geo.country || 'Россия',
      city: geo.city || '',
      org: geo.org || 'Пользователь'
    });

    if (stats.visits.length > 200) {
      stats.visits = stats.visits.slice(0, 200);
    }
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {}
}

function recordPhoneClick() {
  try {
    const stats = getStats();
    stats.phoneClicks = (stats.phoneClicks || 0) + 1;
    const now = new Date();
    const dateKey = now.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
    if (!stats.daily) stats.daily = {};
    if (!stats.daily[dateKey]) {
      stats.daily[dateKey] = { visits: 0, phoneClicks: 0, formSubmits: 0 };
    }
    stats.daily[dateKey].phoneClicks = (stats.daily[dateKey].phoneClicks || 0) + 1;
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {}
}

function serveFile(res, filePath, contentType, extraHeaders = {}) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Not Found');
  }

  const stat = fs.statSync(filePath);
  const headers = {
    'Content-Type': contentType || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': filePath.endsWith('.html') ? 'no-cache, no-store, must-revalidate' : 'public, max-age=86400',
    'Access-Control-Allow-Origin': '*',
    ...extraHeaders
  };

  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

module.exports = function handleAlyansMebel(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const acceptHeader = (req.headers['accept'] || '').toLowerCase();
  const wantsMarkdown = acceptHeader.includes('text/markdown');

  // 1. Favicon & Web App Icons
  if (pathname === '/favicon.ico' || pathname === '/favicon.png') {
    const ico = path.join(__dirname, 'images', 'building.jpg');
    return serveFile(res, ico, 'image/jpeg');
  }

  // Yandex Webmaster Verification
  if (pathname === '/yandex_309df6e0d8c54e60.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>Verification: 309df6e0d8c54e60</body></html>');
  }

  // Google Search Console Verification
  if (pathname === '/google466842291cd2c381.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('google-site-verification: google466842291cd2c381.html');
  }

  // 2. robots.txt
  if (pathname === '/robots.txt') {
    return serveFile(res, path.join(__dirname, 'robots.txt'), 'text/plain; charset=utf-8');
  }

  // 3. sitemap.xml
  if (pathname === '/sitemap.xml') {
    return serveFile(res, path.join(__dirname, 'sitemap.xml'), 'application/xml; charset=utf-8');
  }

  // 4. PWA Assets (manifest.json, sw.js, sounds.js, custom-alert.mp3)
  if (pathname === '/manifest.json') {
    return serveFile(res, path.join(__dirname, 'manifest.json'), 'application/manifest+json; charset=utf-8');
  }
  if (pathname === '/sw.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Service-Worker-Allowed': '/' });
    return fs.createReadStream(path.join(__dirname, 'sw.js')).pipe(res);
  }
  if (pathname === '/sounds.js') {
    return serveFile(res, path.join(__dirname, 'sounds.js'), 'application/javascript; charset=utf-8');
  }
  if (pathname === '/custom-alert.mp3' || pathname.startsWith('/custom-alert.')) {
    if (fs.existsSync(CUSTOM_SOUND_FILE)) {
      return serveFile(res, CUSTOM_SOUND_FILE, 'audio/mpeg');
    }
    // Fallback to built-in sound if not yet uploaded
    return serveFile(res, path.join(__dirname, 'sounds.js'), 'application/javascript; charset=utf-8');
  }

  // 5. Phone Click Counter & Direct Calling redirector
  if (pathname === '/api/click-phone' && req.method === 'POST') {
    recordPhoneClick();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ success: true }));
  }
  if (pathname === '/call') {
    const rawPhone = url.searchParams.get('phone') || '+79092096454';
    const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
    res.writeHead(302, { 'Location': 'tel:' + cleanPhone });
    return res.end();
  }

  // 6. Admin Panel Web Application (/admin)
  if (pathname === '/admin' || pathname === '/admin/') {
    return serveFile(res, path.join(__dirname, 'admin.html'), 'text/html; charset=utf-8', {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
  }

  // 7. Admin API Endpoints
  if (pathname === '/api/admin' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', c => bodyStr += c);
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        if (body.password !== ADMIN_PASSWORD) {
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Неверный пароль' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
          success: true,
          stats: getStats(),
          leads: getLeads(),
          settings: getSettings()
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Ошибка сервера' }));
      }
    });
    return;
  }

  if (pathname === '/api/admin/leads/delete' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', c => bodyStr += c);
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        if (body.password !== ADMIN_PASSWORD) {
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Неверный пароль' }));
        }
        let leads = getLeads();
        leads = leads.filter(l => l.id !== body.leadId);
        saveLeadsList(leads);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Ошибка сервера' }));
      }
    });
    return;
  }

  if (pathname === '/api/admin/upload-sound' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', c => bodyStr += c);
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        if (body.password !== ADMIN_PASSWORD) {
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Неверный пароль' }));
        }
        if (!body.audioData) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Файл не передан' }));
        }

        const parts = body.audioData.split(',');
        const rawBase64 = parts.length > 1 ? parts[1] : parts[0];
        const buffer = Buffer.from(rawBase64, 'base64');
        fs.writeFileSync(CUSTOM_SOUND_FILE, buffer);

        const soundUrl = '/custom-alert.mp3?v=' + Date.now();
        const updated = saveSettings({ ringtone: 'custom', customSoundUrl: soundUrl });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: true, settings: updated, soundUrl }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Ошибка сохранения файла' }));
      }
    });
    return;
  }

  if (pathname === '/api/admin/settings' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', c => bodyStr += c);
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        if (body.password !== ADMIN_PASSWORD) {
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Неверный пароль' }));
        }
        const updated = saveSettings({ ringtone: body.ringtone });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: true, settings: updated }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Ошибка сохранения' }));
      }
    });
    return;
  }

  if (pathname === '/api/admin/test-email' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', c => bodyStr += c);
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        if (body.password !== ADMIN_PASSWORD) {
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Неверный пароль' }));
        }
        const info = await sendLeadEmail({
          name: 'Тестовый Клиент',
          phone: '+7 (909) 209-64-54',
          category: 'Тестовая заявка на мебель (проверка почты)',
          comment: 'Проверка работы почтового уведомления салона Альянс Мебель'
        });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: true, messageId: info?.messageId }));
      } catch (e) {
        console.error('[Test-Email Error]:', e);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: e.message || String(e) }));
      }
    });
    return;
  }

  // 8. Lead submission API (/api/lead) with instant email dispatch
  if (pathname === '/api/lead' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(bodyStr || '{}');
        if (!data.phone || data.phone.trim().length < 6) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ success: false, error: 'Укажите номер телефона' }));
        }
        const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
        const saved = addLead({
          name: data.name || '',
          phone: data.phone.trim(),
          category: data.category || data.furniture || '',
          comment: data.comment || data.style || '',
          source: data.source || 'website',
          ip
        });

        // Отправка email в фоновом режиме (не задерживая ответ клиенту)
        sendLeadEmail(saved).catch(err => {
          console.error('[Lead Mail Error]:', err);
        });

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
          success: true,
          message: 'Спасибо! Ваша заявка принята. Игорь или Инна перезвонят вам в ближайшее время.'
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, error: 'Ошибка сервера' }));
      }
    });
    return;
  }

  // 9. Markdown for Agents content negotiation (Accept: text/markdown)
  if (wantsMarkdown && (pathname === '/' || pathname === '/index' || pathname === '/index.html' || pathname === '')) {
    const llmsPath = path.join(__dirname, 'llms.txt');
    const mdText = fs.existsSync(llmsPath) ? fs.readFileSync(llmsPath, 'utf-8') : '# Альянс Мебель Белгород\n\nСалон мебели Пинскдрев на ул. Благодатная 80.';
    const tokenCount = Math.ceil(Buffer.byteLength(mdText, 'utf-8') / 3.5);
    res.writeHead(200, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'x-markdown-tokens': String(tokenCount),
      'Link': LINK_HEADERS,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(mdText, 'utf-8');
  }

  // 10. llms.txt & auth.md
  if (pathname === '/llms.txt') {
    return serveFile(res, path.join(__dirname, 'llms.txt'), 'text/markdown; charset=utf-8', {
      'Link': LINK_HEADERS,
      'Vary': 'Accept'
    });
  }
  if (pathname === '/auth.md') {
    return serveFile(res, path.join(__dirname, 'auth.md'), 'text/markdown; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 11. RFC 9727 API Catalog
  if (pathname === '/.well-known/api-catalog' || pathname === '/.well-known/api-catalog.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'api-catalog'), 'application/linkset+json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 12. ARD Manifest (ai-catalog.json)
  if (pathname === '/.well-known/ai-catalog.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'ai-catalog.json'), 'application/json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 13. SEP-1649 MCP Server Card
  if (pathname === '/.well-known/mcp/server-card.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'mcp', 'server-card.json'), 'application/json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 14. Agent Skills Index (Cloudflare RFC)
  if (pathname === '/.well-known/agent-skills/index.json' || pathname === '/.well-known/agent-skills') {
    return serveFile(res, path.join(__dirname, '.well-known', 'agent-skills', 'index.json'), 'application/json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 15. OpenID & OAuth 2.0 Discovery
  if (pathname === '/.well-known/openid-configuration' || pathname === '/.well-known/openid-configuration.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'openid-configuration'), 'application/json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }
  if (pathname === '/.well-known/oauth-authorization-server' || pathname === '/.well-known/oauth-authorization-server.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'oauth-authorization-server'), 'application/json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }
  if (pathname === '/.well-known/oauth-protected-resource' || pathname === '/.well-known/oauth-protected-resource.json' || pathname === '/.well-known/oauth-protected-resource/') {
    return serveFile(res, path.join(__dirname, '.well-known', 'oauth-protected-resource'), 'application/json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 16. API Health & OpenAPI
  if (pathname === '/api/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Link': LINK_HEADERS,
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({
      status: 'ok',
      service: 'Альянс Мебель Белгород',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }));
  }
  if (pathname === '/api/openapi.json') {
    return serveFile(res, path.join(__dirname, 'api', 'openapi.json'), 'application/vnd.oai.openapi+json', {
      'Link': LINK_HEADERS
    });
  }

  // 17. Agent Registration Endpoints (WorkOS / auth.md)
  if (pathname === '/api/agent/register') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      status: 'registered',
      client_id: 'agent_' + Date.now().toString(36),
      token_endpoint: 'https://alyansmebel31.ru/api/auth/token'
    }));
  }
  if (pathname === '/api/agent/identity') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      status: 'ok',
      identity_assertion: 'mock_assertion_' + Date.now().toString(36)
    }));
  }
  if (pathname === '/api/agent/claim') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'ok', claimed: true }));
  }
  if (pathname === '/api/agent/event' || pathname === '/api/agent/event/notify') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'received' }));
  }
  if (pathname === '/api/auth/token') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      access_token: 'agent_tok_' + Date.now().toString(36),
      token_type: 'Bearer',
      expires_in: 86400
    }));
  }
  if (pathname === '/api/auth/revoke') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'revoked' }));
  }

  // 18. Main Page (HTML with Link header and recordVisit)
  if (pathname === '/' || pathname === '/index' || pathname === '/index.html' || pathname === '') {
    recordVisit(req);
    return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', {
      'Link': LINK_HEADERS,
      'Vary': 'Accept'
    });
  }

  // 19. Static assets (css, js, images, etc.)
  const safePath = pathname.replace(/^\/+/, '');
  const possibleFile = path.join(__dirname, safePath);

  // Prevent directory traversal
  if (possibleFile.startsWith(__dirname) && fs.existsSync(possibleFile) && fs.statSync(possibleFile).isFile()) {
    const ext = path.extname(possibleFile).toLowerCase();
    const extraHeaders = (ext === '.html' || ext === '.md') ? { 'Link': LINK_HEADERS, 'Vary': 'Accept' } : {};
    return serveFile(res, possibleFile, MIME_TYPES[ext] || 'application/octet-stream', extraHeaders);
  }

  // 20. Fallback to index.html with Link headers
  recordVisit(req);
  return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', {
    'Link': LINK_HEADERS,
    'Vary': 'Accept'
  });
};
