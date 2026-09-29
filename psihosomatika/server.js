const fs = require('fs');
const path = require('path');
const http = require('http');

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

const AFFILIATE_LINK = 'https://bestvebinar.ru/2778186';
const STATS_FILE = path.join(__dirname, 'stats.json');

const AUTH_USER = 'admin';
const AUTH_PASS = 'kontent2026';

const INITIAL_STATS = {
  views: 0,
  clicks: 0,
  lastView: null,
  lastClick: null,
  countries: {},
  recentClicks: []
};

const geoCache = {};

function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🌐';
  }
}

function resolveIpGeo(ip) {
  if (!ip || ip === '—' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return Promise.resolve({ country: 'Россия', countryCode: 'RU', city: 'Москва', org: 'Localhost / РФ' });
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

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket.remoteAddress || '';
}

function getStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(INITIAL_STATS));
}

function saveStats(stats) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {}
}

function recordView(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (ua.includes('spider') || ua.includes('preview')) return;

  const stats = getStats();
  stats.views = (stats.views || 0) + 1;
  stats.lastView = new Date().toISOString();
  saveStats(stats);

  const ip = getClientIp(req);
  if (ip) {
    resolveIpGeo(ip).then(geo => {
      const s = getStats();
      if (!s.countries) s.countries = {};
      const key = `${geo.countryCode || '??'}|${geo.country || 'Неизвестно'}`;
      s.countries[key] = (s.countries[key] || 0) + 1;
      saveStats(s);
    }).catch(() => {});
  }
}

function recordClick(req, url) {
  const stats = getStats();
  stats.clicks = (stats.clicks || 0) + 1;
  stats.lastClick = new Date().toISOString();
  if (!stats.recentClicks) stats.recentClicks = [];

  const utmSource = url.searchParams.get('utm_source') || '';
  const utmCampaign = url.searchParams.get('utm_campaign') || '';
  const utmMedium = url.searchParams.get('utm_medium') || '';
  const ip = getClientIp(req);

  let utmLabel = 'Прямой клик на сайте';
  if (utmSource || utmCampaign) {
    utmLabel = `${utmSource || '—'} / ${utmMedium || '—'} (${utmCampaign || '—'})`;
  }

  const clickItem = {
    time: new Date().toISOString(),
    utm: utmLabel,
    ip: ip || '—',
    country: 'Определяется...',
    countryCode: '',
    city: '',
    org: ''
  };

  stats.recentClicks.unshift(clickItem);
  if (stats.recentClicks.length > 50) {
    stats.recentClicks = stats.recentClicks.slice(0, 50);
  }
  saveStats(stats);

  if (ip) {
    resolveIpGeo(ip).then(geo => {
      const s = getStats();
      const target = (s.recentClicks || []).find(c => c.time === clickItem.time);
      if (target) {
        target.country = geo.country;
        target.countryCode = geo.countryCode;
        target.city = geo.city;
        target.org = geo.org;
        saveStats(s);
      }
    }).catch(() => {});
  }
}

function serveFile(res, filePath, contentType, extraHeaders = {}) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('File Not Found');
  }

  const stat = fs.statSync(filePath);
  const headers = {
    'Content-Type': contentType || 'application/octet-stream',
    'Content-Length': stat.size,
    'Access-Control-Allow-Origin': '*',
    ...extraHeaders
  };

  if (filePath.includes('img') || filePath.endsWith('.png') || filePath.endsWith('.ico') || filePath.endsWith('.webp')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else {
    headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate';
  }

  res.writeHead(200, headers);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}

function formatMskDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + ' МСК';
}

function checkAuth(req, url) {
  if (url.searchParams.get('key') === AUTH_PASS) {
    return { ok: true, setCookie: true };
  }
  const cookie = req.headers['cookie'] || '';
  if (cookie.includes(`stats_auth=${AUTH_PASS}`)) {
    return { ok: true, setCookie: false };
  }
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Basic ')) {
    try {
      const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
      const [user, pass] = credentials.split(':');
      if (user === AUTH_USER && pass === AUTH_PASS) {
        return { ok: true, setCookie: true };
      }
    } catch (e) {}
  }
  return { ok: false };
}

function renderStatsHtml(stats) {
  const views = stats.views || 0;
  const clicks = stats.clicks || 0;
  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';

  const countryEntries = Object.entries(stats.countries || {})
    .sort((a, b) => b[1] - a[1]);

  const countryRows = countryEntries.map(([item, count]) => {
    const parts = item.split('|');
    const code = parts[0] || '??';
    const name = parts[1] || code;
    const flag = getCountryFlag(code);
    const percent = views > 0 ? ((count / views) * 100).toFixed(1) : 0;
    return `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.4rem;">${flag}</span>
          <div>
            <div style="font-weight: 600; color: #f8fafc; font-size: 0.95rem;">${name}</div>
            <div style="color: #64748b; font-size: 0.75rem;">Код: ${code}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-weight: 700; color: #10b981; font-size: 1.1rem;">${count.toLocaleString('ru-RU')}</span>
          <div style="color: #94a3b8; font-size: 0.75rem;">${percent}% визитов</div>
        </div>
      </div>
    `;
  }).join('');

  const recentRows = (stats.recentClicks || []).map((c, i) => {
    const flag = getCountryFlag(c.countryCode || '');
    const location = c.country ? `${flag} ${c.country}${c.city ? ', ' + c.city : ''}` : 'Определяется...';
    const org = c.org ? `<div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">🏢 ${c.org}</div>` : '';
    return `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #94a3b8;">#${i + 1}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); font-variant-numeric: tabular-nums;">${formatMskDate(c.time)}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div style="font-weight: 600; color: #f8fafc;">${location}</div>
          ${org}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #10b981;">${c.utm}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: monospace; color: #a7f3d0;">${c.ip || '—'}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Статистика переходов — БИОпсихосоматика</title>
  <meta http-equiv="refresh" content="15">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #090e17; color: #f8fafc; padding: 30px 20px; min-height: 100vh; }
    .wrap { max-width: 960px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    h1 { font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, #fff 40%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .user-badge { display: flex; align-items: center; gap: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; color: #6ee7b7; }
    .logout-btn { color: #f87171; text-decoration: none; font-weight: 600; margin-left: 6px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 26px; }
    .card { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 18px; padding: 22px; backdrop-filter: blur(12px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    .card-title { font-size: 0.85rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
    .card-val { font-size: 2.2rem; font-weight: 900; color: #fff; }
    .card-sub { font-size: 0.8rem; color: #64748b; margin-top: 6px; }
    .val-clicks { color: #10b981; }
    .val-ctr { color: #34d399; }
    .section-box { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 18px; padding: 24px; margin-bottom: 26px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    .section-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
    .geo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .tip-box { background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 8px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; }
    .table-scroll { overflow-x: auto; }
    .btn-row { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; padding: 10px 18px; border-radius: 10px; font-size: 0.9rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
    .btn-site { background: #10b981; color: #fff; }
    .btn-test { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10b981; }
    .btn-reset { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; }
    .btn:hover { filter: brightness(1.15); }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <h1>📊 Статистика переходов</h1>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 4px;">Сайт: psihosomatika.smartnotes-ai.ru (Оффер Salid: Институт БИОпсихосоматики ID 99025)</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <div class="user-badge">
          <span>🔒 admin</span>
          <a href="/stats?logout=1" class="logout-btn" title="Выйти из системы">Выйти</a>
        </div>
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
          ⚡ Автообновление (15 сек)
        </div>
      </div>
    </div>

    <div class="cards">
      <div class="card">
        <div class="card-title">👁 Просмотры сайта</div>
        <div class="card-val">${views.toLocaleString('ru-RU')}</div>
        <div class="card-sub">Посл. визит: ${formatMskDate(stats.lastView)}</div>
      </div>
      <div class="card">
        <div class="card-title">🖱 Клики по кнопкам</div>
        <div class="card-val val-clicks">${clicks.toLocaleString('ru-RU')}</div>
        <div class="card-sub">Посл. клик: ${formatMskDate(stats.lastClick)}</div>
      </div>
      <div class="card">
        <div class="card-title">📈 Конверсия (CTR)</div>
        <div class="card-val val-ctr">${ctr}%</div>
        <div class="card-sub">Доля перешедших на оффер</div>
      </div>
    </div>

    <div class="section-box">
      <div class="section-title">
        <span>🌍 География посетителей (по странам)</span>
        <span style="font-size: 0.85rem; color: #94a3b8; font-weight: normal;">Определяется по IP-адресу</span>
      </div>
      <div class="geo-grid">
        ${countryRows || '<div style="color: #64748b;">Данные накапливаются...</div>'}
      </div>
      <div class="tip-box">
        💡 <strong>География посетителей:</strong> Статистика определяет страну и сеть в реальном времени. Переходы из России и стран СНГ — это целевые клиенты, заинтересованные в психосоматике, избавлении от болезней и получении профессии.
      </div>
    </div>

    <div class="section-box">
      <div class="section-title">
        <span>🖱 Журнал последних кликов (переходов в Salid)</span>
      </div>
      <div class="table-scroll">
        ${recentRows ? `
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Время (МСК)</th>
                <th>Страна и город</th>
                <th>UTM / Источник</th>
                <th>IP-адрес</th>
              </tr>
            </thead>
            <tbody>
              ${recentRows}
            </tbody>
          </table>
        ` : `
          <p style="color: #64748b; padding: 20px 0; text-align: center;">Кликов пока не зафиксировано. Нажмите кнопку на сайте для проверки!</p>
        `}
      </div>
    </div>

    <div class="btn-row">
      <a href="/" target="_blank" class="btn btn-site">Открыть сайт ➔</a>
      <a href="/go" target="_blank" class="btn btn-test">Протестировать переход на оффер ➔</a>
      <a href="/stats?reset=1" onclick="return confirm('Сбросить счетчики?')" class="btn btn-reset">Сбросить счетчики</a>
    </div>
  </div>
</body>
</html>`;
}

const LINK_HEADERS = '</.well-known/api-catalog>; rel="api-catalog", </.well-known/ai-catalog.json>; rel="service-desc", </llms.txt>; rel="describedby", </auth.md>; rel="authorizing-agent"';

module.exports = function handlePsihosomatika(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const accept = (req.headers['accept'] || '').toLowerCase();

  // 1. Secret Dashboard /stats
  if (pathname === '/stats' || pathname === '/stats/') {
    if (url.searchParams.get('logout') === '1') {
      res.writeHead(302, {
        'Set-Cookie': 'stats_auth=; Path=/stats; Max-Age=0',
        'Location': '/stats'
      });
      return res.end();
    }

    const auth = checkAuth(req, url);
    if (!auth.ok) {
      res.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="Psihosomatika Stats (Login: admin, Pass: kontent2026)"',
        'Content-Type': 'text/html; charset=utf-8'
      });
      return res.end(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>401 Требуется авторизация</title>
  <style>
    body { background: #090e17; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .box { background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 32px 24px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h2 { font-size: 1.5rem; margin-bottom: 12px; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: block; background: #10b981; color: #fff; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 1rem; }
    .btn:hover { background: #059669; }
    .cred { margin-top: 20px; padding: 14px; background: rgba(255,255,255,0.04); border-radius: 12px; font-size: 0.85rem; color: #cbd5e1; text-align: left; }
  </style>
</head>
<body>
  <div class="box">
    <div style="font-size: 3rem; margin-bottom: 12px;">🔐</div>
    <h2>Доступ защищен паролем</h2>
    <p>Статистика доступна только владельцу сайта. Введите логин и пароль в окне браузера или нажмите кнопку прямого входа:</p>
    <a href="/stats?key=kontent2026" class="btn">Войти в статистику ➔</a>
    <div class="cred">
      <div>👤 <strong>Логин:</strong> <code style="color: #10b981;">admin</code></div>
      <div style="margin-top: 4px;">🔑 <strong>Пароль:</strong> <code style="color: #10b981;">kontent2026</code></div>
    </div>
  </div>
</body>
</html>`);
    }

    if (url.searchParams.get('reset') === '1') {
      saveStats({ views: 0, clicks: 0, lastView: null, lastClick: null, countries: {}, recentClicks: [] });
      res.writeHead(302, { Location: '/stats' });
      return res.end();
    }

    const stats = getStats();
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    };
    if (auth.setCookie) {
      headers['Set-Cookie'] = `stats_auth=${AUTH_PASS}; Path=/stats; Max-Age=31536000; SameSite=Lax`;
    }
    res.writeHead(200, headers);
    return res.end(renderStatsHtml(stats));
  }

  // 2. Markdown Content Negotiation for AI Agents (Accept: text/markdown or /index.md)
  if ((accept.includes('text/markdown') && (pathname === '/' || pathname === '/index' || pathname === '/main' || pathname === '')) || pathname === '/index.md') {
    const mdPath = path.join(__dirname, 'llms.txt');
    return serveFile(res, mdPath, 'text/markdown; charset=utf-8', {
      'x-markdown-tokens': '580',
      'Vary': 'Accept',
      'Link': LINK_HEADERS
    });
  }

  // 3. Direct Redirect / Click tracking to Salid Offer
  if (pathname === '/go' || pathname === '/webinar' || pathname === '/join' || pathname === '/register') {
    recordClick(req, url);
    const targetUrl = new URL(AFFILIATE_LINK);
    url.searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });
    res.writeHead(302, { Location: targetUrl.toString() });
    return res.end();
  }

  // 4. robots.txt
  if (pathname === '/robots.txt') {
    return serveFile(res, path.join(__dirname, 'robots.txt'), 'text/plain; charset=utf-8');
  }

  // 5. sitemap.xml
  if (pathname === '/sitemap.xml') {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://psihosomatika.smartnotes-ai.ru/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
    return res.end(sitemap);
  }

  // 5b. Yandex Webmaster Verification
  if (pathname === '/yandex_7134c2187fdd333c.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>Verification: 7134c2187fdd333c</body></html>');
  }

  // 6. llms.txt & auth.md
  if (pathname === '/llms.txt') {
    return serveFile(res, path.join(__dirname, 'llms.txt'), 'text/markdown; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }
  if (pathname === '/auth.md') {
    return serveFile(res, path.join(__dirname, 'auth.md'), 'text/markdown; charset=utf-8');
  }

  // 7. RFC 9727 API Catalog
  if (pathname === '/.well-known/api-catalog') {
    return serveFile(res, path.join(__dirname, '.well-known', 'api-catalog'), 'application/linkset+json');
  }

  // 8. ARD Manifest (ai-catalog.json)
  if (pathname === '/.well-known/ai-catalog.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'ai-catalog.json'), 'application/json; charset=utf-8');
  }

  // 9. MCP Server Card
  if (pathname === '/.well-known/mcp/server-card.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'mcp', 'server-card.json'), 'application/json; charset=utf-8');
  }

  // 10. Agent Skills Index
  if (pathname === '/.well-known/agent-skills/index.json' || pathname === '/.well-known/agent-skills') {
    return serveFile(res, path.join(__dirname, '.well-known', 'agent-skills', 'index.json'), 'application/json; charset=utf-8');
  }

  // 11. OpenID & OAuth Discovery
  if (pathname === '/.well-known/openid-configuration' || pathname === '/.well-known/openid-configuration.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'openid-configuration'), 'application/json; charset=utf-8');
  }
  if (pathname === '/.well-known/oauth-authorization-server' || pathname === '/.well-known/oauth-authorization-server.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'oauth-authorization-server'), 'application/json; charset=utf-8');
  }
  if (pathname === '/.well-known/oauth-protected-resource' || pathname === '/.well-known/oauth-protected-resource.json' || pathname === '/.well-known/oauth-protected-resource/') {
    return serveFile(res, path.join(__dirname, '.well-known', 'oauth-protected-resource'), 'application/json; charset=utf-8');
  }

  // 12. Agent Registration endpoints (WorkOS auth.md discovery)
  if (pathname === '/api/agent/register') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      status: 'registered',
      client_id: 'agent_' + Date.now().toString(36),
      token_endpoint: 'https://psihosomatika.smartnotes-ai.ru/api/auth/token'
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

  // 13. API Health & OpenAPI
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'ok', service: 'psihosomatika-institute' }));
  }
  if (pathname === '/api/openapi.json') {
    return serveFile(res, path.join(__dirname, 'api', 'openapi.json'), 'application/vnd.oai.openapi+json');
  }

  // 14. Main page (/) with RFC 8288 Link headers
  if (pathname === '/' || pathname === '/index' || pathname === '/index.html' || pathname === '') {
    recordView(req);
    return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 15. General file lookup
  const possibleFile = path.join(__dirname, pathname.replace(/^\//, ''));
  if (fs.existsSync(possibleFile) && fs.statSync(possibleFile).isFile()) {
    const ext = path.extname(possibleFile).toLowerCase();
    return serveFile(res, possibleFile, MIME_TYPES[ext]);
  }

  // Fallback to main page
  recordView(req);
  return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', {
    'Link': LINK_HEADERS
  });
};
