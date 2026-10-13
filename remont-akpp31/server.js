const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const LINK_HEADERS = '</.well-known/api-catalog>; rel="api-catalog", </.well-known/ai-catalog.json>; rel="service-desc", </llms.txt>; rel="service-doc", </llms.txt>; rel="describedby", </auth.md>; rel="authorizing-agent"';

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STATS_FILE)) {
    fs.writeFileSync(STATS_FILE, JSON.stringify({
      totalVisits: 0,
      phoneClicks: 0,
      formSubmits: 0,
      visits: []
    }, null, 2), 'utf-8');
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function getStats() {
  ensureDataFiles();
  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
  } catch (e) {
    return { totalVisits: 0, phoneClicks: 0, formSubmits: 0, visits: [] };
  }
}

function getLeads() {
  ensureDataFiles();
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
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
}

function recordPhoneClick() {
  ensureDataFiles();
  const stats = getStats();
  stats.phoneClicks += 1;
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  return stats.phoneClicks;
}

function addLead(data) {
  ensureDataFiles();
  const leads = getLeads();
  const newLead = {
    ...data,
    id: 'lead_' + Date.now().toString(36),
    createdAt: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
  };
  leads.unshift(newLead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');

  const stats = getStats();
  stats.formSubmits += 1;
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
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
  '.md': 'text/markdown; charset=utf-8'
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

module.exports = function handleRemontAkpp(req, res) {
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
  if (pathname === '/manifest.json') {
    return serveStatic(res, path.join(PUBLIC_DIR, 'manifest.json'), pathname);
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
        const geo = await resolveIpGeo(ip);

        const lead = addLead({
          phone: body.phone.trim(),
          carBrand: body.carBrand || 'Не указано',
          reason: body.reason || 'Ремонт АКПП',
          details: body.details || '',
          city: geo.city || '',
          source: 'remont-akpp31.obd2scanai.ru'
        });

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: true, lead }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Ошибка сохранения заявки' }));
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
          leads: getLeads()
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Ошибка сервера' }));
      }
    });
    return;
  }

  // Админка HTML
  if (pathname === '/admin') {
    const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
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
