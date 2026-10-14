const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const DATA_DIR = path.join(__dirname, 'data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const LINK_HEADERS = '</.well-known/api-catalog>; rel="api-catalog", </.well-known/ai-catalog.json>; rel="service-desc", </llms.txt>; rel="service-doc", </llms.txt>; rel="describedby", </auth.md>; rel="authorizing-agent"';

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
  tls: {
    rejectUnauthorized: false
  }
});

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
  tls: {
    rejectUnauthorized: false
  }
});

async function sendLeadEmail(lead) {
  const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
  const waPhone = cleanPhone.replace(/^\+/, '');

  const textBody = `Новая заявка на ремонт СТО АКПП Белгород:\n\nНОМЕР ТЕЛЕФОНА (ДЛЯ КОПИРОВАНИЯ):\n${lead.phone}\n${cleanPhone}\n\nАвтомобиль: ${lead.carBrand || 'Не указан'}\nПричина: ${lead.reason || 'Ремонт АКПП'}\nГород: ${lead.city || 'Белгород'}\nСимптомы: ${lead.details || '—'}\nВремя: ${lead.createdAt}`;

  const mailOptions = {
    from: '"СТО АКПП Белгород" <andrey.chemarev@yandex.ru>',
    to: 'autoneuro24@gmail.com',
    subject: `Новая заявка: ${lead.phone} • ${lead.carBrand || 'Авто'} (${lead.city || 'Белгород'})`,
    text: textBody,
    html: `
      <!-- Верхний контрастный блок: сразу при открытии письма -->
      <div style="background-color: #ffffff; color: #000000; padding: 18px; border-radius: 12px; border: 3px solid #22c55e; max-width: 550px; margin-bottom: 18px; font-family: Arial, sans-serif; box-sizing: border-box;">
        <div style="font-size: 13px; font-weight: bold; color: #475569; text-transform: uppercase; margin-bottom: 6px;">
          📞 Номер клиента (нажмите для звонка или скопируйте):
        </div>
        <div style="font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 10px; font-family: Consolas, monospace; letter-spacing: 1px;">
          <a href="tel:${cleanPhone}" style="color: #16a34a; text-decoration: none;">${lead.phone}</a>
        </div>
        <div style="font-size: 14px; color: #334155; margin-bottom: 10px;">
          Чистый номер: <strong style="font-family: Consolas, monospace; font-size: 17px; color: #0f172a;">${cleanPhone}</strong>
        </div>
        <div style="display: block; margin-top: 8px;">
          <a href="tel:${cleanPhone}" style="display: inline-block; background-color: #22c55e; color: #ffffff; font-weight: bold; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 14px; margin-right: 8px; margin-bottom: 6px;">
            📞 Позвонить
          </a>
          ${waPhone ? `<a href="https://wa.me/${waPhone}" style="display: inline-block; background-color: #25D366; color: #ffffff; font-weight: bold; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 14px; margin-bottom: 6px;">💬 Написать в WhatsApp</a>` : ''}
        </div>
      </div>

      <div style="font-family: Arial, sans-serif; background-color: #0b0e14; color: #ffffff; padding: 24px; border-radius: 14px; max-width: 550px; border: 2px solid #ff5e14;">
        <h2 style="color: #ff5e14; margin-top: 0; font-size: 22px;">🚗 Новая заявка на ремонт!</h2>
        <p style="font-size: 14px; color: #9ca3af; margin-bottom: 20px;">Поступила через сайт remont-akpp31.obd2scanai.ru</p>
        
        <div style="background-color: #161922; padding: 16px; border-radius: 10px; margin-bottom: 16px; border: 1px solid #262b36;">
          <p style="margin: 6px 0; font-size: 16px;"><strong>📞 Телефон:</strong> <a href="tel:${cleanPhone}" style="color: #22c55e; font-weight: bold; text-decoration: none; font-size: 18px;">${lead.phone}</a></p>
          <p style="margin: 6px 0; font-size: 15px;"><strong>🚘 Автомобиль:</strong> ${lead.carBrand || 'Не указан'}</p>
          <p style="margin: 6px 0; font-size: 15px;"><strong>⚙️ Причина обращения:</strong> <span style="color: #f59e0b;">${lead.reason}</span></p>
          <p style="margin: 6px 0; font-size: 15px;"><strong>📍 Город / Локация:</strong> ${lead.city || 'Белгород'}</p>
          ${lead.details ? `<p style="margin: 6px 0; font-size: 14px; color: #cbd5e1;"><strong>💬 Симптомы:</strong> <em>«${lead.details}»</em></p>` : ''}
          <p style="margin: 6px 0; font-size: 12px; color: #6b7280;"><strong>⏰ Время:</strong> ${lead.createdAt}</p>
        </div>

        <p style="margin: 0; text-align: center;">
          <a href="tel:${cleanPhone}" style="display: inline-block; background-color: #22c55e; color: #ffffff; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 16px;">Позвонить клиенту</a>
        </p>
        
        <hr style="border: 0; border-top: 1px solid #262b36; margin: 20px 0 10px 0;" />
        <p style="color: #6b7280; font-size: 11px; text-align: center;">СТО Ремонт АКПП • г. Белгород, ул. Серафимовича, 75</p>
      </div>

      <!-- Блок для удобного копирования и быстрого набора на телефоне -->
      <div style="margin-top: 16px; padding: 18px; background-color: #ffffff; color: #000000; border-radius: 14px; border: 3px solid #22c55e; max-width: 550px; font-family: Arial, sans-serif;">
        <div style="font-size: 13px; font-weight: bold; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          📋 Номер для быстрого копирования и набора:
        </div>
        
        <div style="font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 12px; font-family: Consolas, 'Courier New', monospace; letter-spacing: 1px; user-select: all; -webkit-user-select: all;">
          ${lead.phone}
        </div>

        <div style="margin-bottom: 14px; font-size: 14px; color: #334155;">
          Чистый номер (для вставки в контакты / WhatsApp):<br />
          <strong style="font-family: Consolas, monospace; font-size: 18px; color: #0284c7; user-select: all; -webkit-user-select: all;">${cleanPhone}</strong>
        </div>

        <div style="display: block; margin-top: 10px;">
          <a href="tel:${cleanPhone}" style="display: inline-block; background-color: #22c55e; color: #ffffff; font-weight: bold; padding: 12px 22px; border-radius: 10px; text-decoration: none; font-size: 15px; margin-right: 8px; margin-bottom: 8px;">
            📞 Набрать номер в телефоне
          </a>
          ${waPhone ? `<a href="https://wa.me/${waPhone}" style="display: inline-block; background-color: #25D366; color: #ffffff; font-weight: bold; padding: 12px 22px; border-radius: 10px; text-decoration: none; font-size: 15px; margin-bottom: 8px;">💬 Написать в WhatsApp</a>` : ''}
        </div>
      </div>
    `
  };

  try {
    const info = await transporter587.sendMail(mailOptions);
    console.log('[Email Port 587] Lead notification sent:', info.messageId);
    return info;
  } catch (err587) {
    console.warn('[Email Port 587 failed, trying 465]:', err587.message);
    const info = await transporter465.sendMail(mailOptions);
    console.log('[Email Port 465] Lead notification sent:', info.messageId);
    return info;
  }
}

function ensureDataFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Проверка и самовосстановление STATS_FILE
    try {
      if (!fs.existsSync(STATS_FILE) || !fs.readFileSync(STATS_FILE, 'utf-8').trim()) {
        fs.writeFileSync(STATS_FILE, JSON.stringify({ totalVisits: 0, phoneClicks: 0, formSubmits: 0, visits: [] }, null, 2), 'utf-8');
      } else {
        JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
      }
    } catch (e) {
      fs.writeFileSync(STATS_FILE, JSON.stringify({ totalVisits: 0, phoneClicks: 0, formSubmits: 0, visits: [] }, null, 2), 'utf-8');
    }

    // Проверка и самовосстановление LEADS_FILE
    try {
      if (!fs.existsSync(LEADS_FILE) || !fs.readFileSync(LEADS_FILE, 'utf-8').trim()) {
        fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf-8');
      } else {
        JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
      }
    } catch (e) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }

    // Проверка и самовосстановление SETTINGS_FILE
    try {
      if (!fs.existsSync(SETTINGS_FILE) || !fs.readFileSync(SETTINGS_FILE, 'utf-8').trim()) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ ringtone: 'bell', customSoundUrl: '' }, null, 2), 'utf-8');
      } else {
        JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      }
    } catch (e) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ ringtone: 'bell', customSoundUrl: '' }, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[Data Files] Error ensuring files:', err);
  }
}

function getSettings() {
  try {
    ensureDataFiles();
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8').trim();
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.error('[Settings Read Error]:', e);
  }
  return { ringtone: 'bell', customSoundUrl: '' };
}

function saveSettings(newSettings) {
  try {
    ensureDataFiles();
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (e) {
    console.error('[Settings] Error saving:', e);
    return { ringtone: 'bell', customSoundUrl: '', ...newSettings };
  }
}

function getStats() {
  try {
    ensureDataFiles();
    if (fs.existsSync(STATS_FILE)) {
      const raw = fs.readFileSync(STATS_FILE, 'utf-8').trim();
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.error('[Stats Read Error]:', e);
  }
  return { totalVisits: 0, phoneClicks: 0, formSubmits: 0, visits: [] };
}

let inMemoryLeads = [];
function getLeads() {
  try {
    ensureDataFiles();
    if (fs.existsSync(LEADS_FILE)) {
      const raw = fs.readFileSync(LEADS_FILE, 'utf-8').trim();
      if (raw) {
        const fileData = JSON.parse(raw);
        if (Array.isArray(fileData)) return fileData;
      }
    }
  } catch (e) {
    console.error('[Leads Read Error]:', e);
  }
  return inMemoryLeads;
}

const http = require('http');

const geoCache = {};

function resolveIpGeo(ip) {
  if (!ip || ip === '—' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return Promise.resolve({ country: 'Россия', countryCode: 'RU', city: 'Белгород', org: 'Локальная сеть / РФ' });
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
    req.setTimeout(2500, () => {
      try { req.abort(); } catch (e) {}
      resolve({ country: 'Неизвестно', countryCode: '', city: '', org: '' });
    });
  });
}

async function recordVisit(userAgent, referer, ip) {
  try {
    ensureDataFiles();
    const geo = await resolveIpGeo(ip);
    const stats = getStats();
    stats.totalVisits += 1;
    stats.visits.unshift({
      timestamp: new Date().toISOString(),
      userAgent: userAgent || 'Unknown',
      referer: referer || 'Прямой заход',
      ip: ip || '127.0.0.1',
      city: geo.city || '',
      country: geo.country || '',
      countryCode: geo.countryCode || '',
      org: geo.org || ''
    });
    if (stats.visits.length > 200) {
      stats.visits = stats.visits.slice(0, 200);
    }
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {
    console.error('[recordVisit Error]:', e);
  }
}

function recordPhoneClick() {
  try {
    ensureDataFiles();
    const stats = getStats();
    stats.phoneClicks += 1;
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
    return stats.phoneClicks;
  } catch (e) {
    console.error('[recordPhoneClick Error]:', e);
    return 1;
  }
}

function addLead(data) {
  const newLead = {
    ...data,
    id: 'lead_' + Date.now().toString(36),
    createdAt: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
  };
  inMemoryLeads.unshift(newLead);

  try {
    ensureDataFiles();
    const leads = getLeads();
    if (!leads.some(l => l.id === newLead.id)) {
      leads.unshift(newLead);
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Leads Write Error]:', err);
  }

  try {
    const stats = getStats();
    stats.formSubmits = (stats.formSubmits || 0) + 1;
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (err) {}

  return newLead;
}

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
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac'
};

function serveStatic(res, filePath, pathname = '') {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  }
  const ext = path.extname(filePath).toLowerCase();
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';

  if (pathname.endsWith('/api-catalog')) {
    contentType = 'application/linkset+json; charset=utf-8';
  } else if (pathname.endsWith('llms.txt') || pathname.endsWith('auth.md')) {
    contentType = 'text/markdown; charset=utf-8';
  } else if (pathname.includes('/.well-known/') && !ext) {
    contentType = 'application/json; charset=utf-8';
  }

  const headers = {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  };

  if (ext === '.html' || ext === '.md' || pathname === '/' || pathname.includes('/.well-known/') || pathname.endsWith('llms.txt')) {
    headers['Link'] = LINK_HEADERS;
    headers['Vary'] = 'Accept';
  }

  if (filePath.includes('/_next/') || filePath.includes('/images/')) {
    headers['Cache-Control'] = 'public, max-age=86400';
  } else {
    headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate';
  }

  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

module.exports = async function handleRemontAkpp(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  // Markdown content negotiation (Accept: text/markdown)
  const acceptHeader = (req.headers['accept'] || '').toLowerCase();
  const wantsMarkdown = acceptHeader.includes('text/markdown');

  if (wantsMarkdown && (pathname === '/' || pathname === '/index' || pathname === '/main')) {
    const llmsPath = path.join(PUBLIC_DIR, 'llms.txt');
    const mdText = fs.existsSync(llmsPath) ? fs.readFileSync(llmsPath, 'utf-8') : '# СТО Ремонт АКПП Белгород\n\nПрофессиональный ремонт автоматических коробок передач.';
    const tokenCount = Math.ceil(Buffer.byteLength(mdText, 'utf-8') / 3.5);
    res.writeHead(200, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'x-markdown-tokens': String(tokenCount),
      'Link': LINK_HEADERS,
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(mdText, 'utf-8');
  }

  // API Health
  if (pathname === '/api/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Link': LINK_HEADERS,
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({ status: 'ok', service: 'СТО Ремонт АКПП Белгород', timestamp: new Date().toISOString() }));
  }

  // Раздача статики Next.js (CSS, JS)
  if (pathname.startsWith('/_next/')) {
    const relativePath = pathname.replace('/_next/', '');
    const assetPath = path.join(PUBLIC_DIR, '_next', relativePath);
    return serveStatic(res, assetPath, pathname);
  }

  // Раздача картинок
  if (pathname.startsWith('/images/')) {
    const imgName = path.basename(pathname);
    const imgPath = path.join(PUBLIC_DIR, 'images', imgName);
    return serveStatic(res, imgPath, pathname);
  }

  // SEO & Agent Discovery файлы
  if (pathname === '/robots.txt') {
    return serveStatic(res, path.join(PUBLIC_DIR, 'robots.txt'), pathname);
  }
  if (pathname === '/sitemap.xml') {
    return serveStatic(res, path.join(PUBLIC_DIR, 'sitemap.xml'), pathname);
  }
  if (pathname === '/llms.txt') {
    return serveStatic(res, path.join(PUBLIC_DIR, 'llms.txt'), pathname);
  }
  if (pathname === '/auth.md') {
    return serveStatic(res, path.join(PUBLIC_DIR, 'auth.md'), pathname);
  }
  if (pathname === '/sounds.js') {
    return serveStatic(res, path.join(PUBLIC_DIR, 'sounds.js'), pathname);
  }
  if (pathname === '/manifest.json') {
    return serveStatic(res, path.join(PUBLIC_DIR, 'manifest.json'), pathname);
  }
  if (pathname === '/custom-alert.mp3' || pathname.startsWith('/custom-alert.')) {
    const ext = path.extname(pathname) || '.mp3';
    return serveStatic(res, path.join(PUBLIC_DIR, 'custom-alert' + ext), pathname);
  }
  if (pathname === '/sw.js') {
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/'
    });
    return fs.createReadStream(path.join(PUBLIC_DIR, 'sw.js')).pipe(res);
  }
  if (pathname === '/google466842291cd2c381.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('google-site-verification: google466842291cd2c381.html');
  }

  // /.well-known discovery
  if (pathname === '/.well-known/api-catalog' || pathname === '/.well-known/api-catalog.json') {
    return serveStatic(res, path.join(PUBLIC_DIR, '.well-known', 'api-catalog'), pathname);
  }
  if (pathname === '/.well-known/ai-catalog.json') {
    return serveStatic(res, path.join(PUBLIC_DIR, '.well-known', 'ai-catalog.json'), pathname);
  }
  if (pathname === '/.well-known/mcp/server-card.json') {
    return serveStatic(res, path.join(PUBLIC_DIR, '.well-known', 'mcp', 'server-card.json'), pathname);
  }
  if (pathname === '/.well-known/agent-skills/index.json') {
    return serveStatic(res, path.join(PUBLIC_DIR, '.well-known', 'agent-skills', 'index.json'), pathname);
  }
  if (pathname === '/.well-known/oauth-authorization-server') {
    return serveStatic(res, path.join(PUBLIC_DIR, '.well-known', 'oauth-authorization-server'), pathname);
  }
  if (pathname === '/.well-known/oauth-protected-resource') {
    return serveStatic(res, path.join(PUBLIC_DIR, '.well-known', 'oauth-protected-resource'), pathname);
  }
  if (pathname === '/.well-known/openid-configuration') {
    return serveStatic(res, path.join(PUBLIC_DIR, '.well-known', 'openid-configuration'), pathname);
  }

  // API Трекинг
  if (pathname === '/api/track' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const userAgent = req.headers['user-agent'] || '';
        const referer = body.referer || req.headers['referer'] || 'Прямой заход';
        const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';

        if (body.action === 'phone_click') {
          const count = recordPhoneClick();
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ success: true, phoneClicks: count }));
        }

        if (body.action === 'visit') {
          recordVisit(userAgent, referer, ip);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ success: true }));
        }

        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Invalid action' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Server error' }));
      }
    });
    return;
  }

  // API Заявки
  if (pathname === '/api/lead' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        if (!body.phone || body.phone.trim().length < 6) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Укажите номер телефона' }));
        }

        const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
        let geo = { city: 'Белгород' };
        try {
          geo = await resolveIpGeo(ip);
        } catch (e) {}

        let lead;
        try {
          lead = addLead({
            phone: body.phone.trim(),
            carBrand: body.carBrand || 'Не указано',
            reason: body.reason || 'Ремонт АКПП',
            details: body.details || '',
            city: geo.city || '',
            source: 'remont-akpp31.obd2scanai.ru'
          });
        } catch (leadErr) {
          console.error('[addLead Error]:', leadErr);
          lead = {
            id: 'lead_' + Date.now().toString(36),
            phone: body.phone.trim(),
            carBrand: body.carBrand || 'Не указано',
            reason: body.reason || 'Ремонт АКПП',
            details: body.details || '',
            city: geo.city || '',
            source: 'remont-akpp31.obd2scanai.ru',
            createdAt: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
          };
        }

        // Мгновенный ответ клиенту на сайте (чтобы форма не зависала)
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, lead }));

        // Отправка email-уведомления на почту мастера в фоновом режиме
        sendLeadEmail(lead).catch(mailErr => {
          console.error('[Lead Mail Error]:', mailErr);
        });
        return;
      } catch (e) {
        console.error('[API Lead Global Catch]:', e);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Ошибка сохранения заявки', details: e.message || String(e) }));
      }
    });
    return;
  }

  // API Админки
  if (pathname === '/api/admin' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        if (body.password !== 'admin2026') {
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
        console.error('[Admin API] Error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Ошибка сервера: ' + (e.message || String(e)) }));
      }
    });
    return;
  }

  // API Сохранение настроек звука
  if (pathname === '/api/admin/settings' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        if (body.password !== 'admin2026') {
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Неверный пароль' }));
        }
        const updated = saveSettings({ ringtone: body.ringtone });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: true, settings: updated }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Ошибка сохранения настроек' }));
      }
    });
    return;
  }

  // API Загрузка своей мелодии на сервер (без ограничений localStorage)
  if (pathname === '/api/admin/upload-sound' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        if (body.password !== 'admin2026') {
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

        if (!fs.existsSync(PUBLIC_DIR)) {
          fs.mkdirSync(PUBLIC_DIR, { recursive: true });
        }

        const filePath = path.join(PUBLIC_DIR, 'custom-alert.mp3');
        fs.writeFileSync(filePath, buffer);

        const soundUrl = '/custom-alert.mp3?v=' + Date.now();
        const updated = saveSettings({ ringtone: 'custom', customSoundUrl: soundUrl });

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: true, settings: updated, soundUrl }));
      } catch (e) {
        console.error('[Sound Upload] Error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Ошибка сохранения файла на сервере' }));
      }
    });
    return;
  }

  // Диагностика подключения к SMTP портам
  if (pathname === '/api/admin/check-smtp') {
    const net = require('net');
    function testPort(host, port) {
      return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(4000);
        socket.on('connect', () => {
          socket.destroy();
          resolve({ port, status: 'OPEN' });
        });
        socket.on('timeout', () => {
          socket.destroy();
          resolve({ port, status: 'TIMED_OUT' });
        });
        socket.on('error', (err) => {
          socket.destroy();
          resolve({ port, status: 'ERROR: ' + err.message });
        });
        socket.connect(port, host);
      });
    }

    const [res465, res587] = await Promise.all([
      testPort('smtp.yandex.ru', 465),
      testPort('smtp.yandex.ru', 587)
    ]);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ host: 'smtp.yandex.ru', ports: { 465: res465, 587: res587 } }));
  }

  // API Тест отправки письма
  if (pathname === '/api/admin/test-email') {
    try {
      const info = await sendLeadEmail({
        phone: '+7 (905) 879-14-35',
        carBrand: 'Тестовая заявка',
        reason: 'Проверка работы почты',
        details: 'Уведомление успешно доставлено с сервера СТО',
        city: 'Белгород',
        createdAt: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
      });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true, messageId: info?.messageId, message: 'Письмо отправлено на autoneuro24@gmail.com' }));
    } catch (e) {
      console.error('[test-email error]:', e);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: false, error: e.message || String(e), code: e.code }));
    }
  }

  // Админка HTML
  if (pathname === '/admin') {
    const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf-8');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    return res.end(adminHtml);
  }

  // Главная страница HTML с Link header
  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Link': LINK_HEADERS,
    'Vary': 'Accept'
  });
  return res.end(indexHtml);
};
