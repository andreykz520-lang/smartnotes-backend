const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

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

function recordVisit(userAgent, referer, ip) {
  ensureDataFiles();
  const stats = getStats();
  stats.totalVisits += 1;
  stats.visits.unshift({
    timestamp: new Date().toISOString(),
    userAgent: userAgent || 'Unknown',
    referer: referer || 'Прямой заход',
    ip: ip || '127.0.0.1'
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
  '.ico': 'image/x-icon'
};

function serveStatic(res, filePath) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=86400'
  });
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

  // Раздача статики Next.js (CSS, JS)
  if (pathname.startsWith('/_next/')) {
    const relativePath = pathname.replace('/_next/', '');
    const assetPath = path.join(PUBLIC_DIR, '_next', relativePath);
    return serveStatic(res, assetPath);
  }

  // Раздача картинок
  if (pathname.startsWith('/images/')) {
    const imgName = path.basename(pathname);
    const imgPath = path.join(PUBLIC_DIR, 'images', imgName);
    return serveStatic(res, imgPath);
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
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        if (!body.phone || body.phone.trim().length < 6) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Укажите номер телефона' }));
        }

        const lead = addLead({
          phone: body.phone.trim(),
          carBrand: body.carBrand || 'Не указано',
          reason: body.reason || 'Ремонт АКПП',
          details: body.details || '',
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

  // Главная страница HTML
  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  return res.end(indexHtml);
};
