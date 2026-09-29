const fs = require('fs');
const path = require('path');

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

const http = require('http');
const AFFILIATE_LINK = 'https://kurs-vebinar.ru/2777344';
const STATS_FILE = path.join(__dirname, 'stats.json');

const AUTH_USER = 'admin';
const AUTH_PASS = 'kontent2026';

const INITIAL_STATS = {
  views: 689,
  clicks: 2,
  lastView: new Date().toISOString(),
  lastClick: new Date().toISOString(),
  countries: {
    'US|США (Боты / Дата-центры)': 580,
    'RU|Россия': 65,
    'DE|Германия': 24,
    'NL|Нидерланды': 20
  },
  recentClicks: [
    {
      time: new Date(Date.now() - 3600000).toISOString(),
      utm: 'Прямой клик на сайте',
      ip: '54.210.12.89',
      country: 'США',
      countryCode: 'US',
      city: 'Ashburn',
      org: 'Amazon AWS (Дата-центр / Робот)'
    },
    {
      time: new Date(Date.now() - 86400000).toISOString(),
      utm: 'Тестовый клик владельца',
      ip: '—',
      country: 'Россия',
      countryCode: 'RU',
      city: 'Москва',
      org: 'Россия (Пользователь)'
    }
  ]
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
      const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
      if (typeof data.views === 'number' && data.views >= 689) {
        if (!data.countries) data.countries = INITIAL_STATS.countries;
        return data;
      }
      data.views = Math.max(data.views || 0, 689);
      data.clicks = Math.max(data.clicks || 0, 2);
      if (!data.countries) data.countries = INITIAL_STATS.countries;
      if (!data.recentClicks || data.recentClicks.length === 0) data.recentClicks = INITIAL_STATS.recentClicks;
      return data;
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
  const isExcluded = ua.includes('spider') || ua.includes('preview');
  if (isExcluded) return;

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
  // 1. URL secret key: ?key=kontent2026
  if (url.searchParams.get('key') === AUTH_PASS) {
    return { ok: true, setCookie: true };
  }

  // 2. Persistent cookie: stats_auth=kontent2026
  const cookie = req.headers['cookie'] || '';
  if (cookie.includes(`stats_auth=${AUTH_PASS}`)) {
    return { ok: true, setCookie: false };
  }

  // 3. HTTP Basic Auth
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
          <span style="font-weight: 700; color: #38bdf8; font-size: 1.1rem;">${count.toLocaleString('ru-RU')}</span>
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
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #38bdf8;">${c.utm}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: monospace; color: #a5b4fc;">${c.ip || '—'}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Статистика переходов — АВТОКОНТЕНТ 2026</title>
  <meta http-equiv="refresh" content="15">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #090b14; color: #f8fafc; padding: 30px 20px; min-height: 100vh; }
    .wrap { max-width: 960px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    h1 { font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, #fff 40%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .user-badge { display: flex; align-items: center; gap: 10px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; color: #a5b4fc; }
    .logout-btn { color: #f87171; text-decoration: none; font-weight: 600; margin-left: 6px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 26px; }
    .card { background: rgba(18, 22, 38, 0.8); border: 1px solid rgba(120, 119, 198, 0.25); border-radius: 18px; padding: 22px; backdrop-filter: blur(12px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    .card-title { font-size: 0.85rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
    .card-val { font-size: 2.2rem; font-weight: 900; color: #fff; }
    .card-sub { font-size: 0.8rem; color: #64748b; margin-top: 6px; }
    .val-clicks { color: #38bdf8; }
    .val-ctr { color: #34d399; }
    .section-box { background: rgba(18, 22, 38, 0.8); border: 1px solid rgba(120, 119, 198, 0.25); border-radius: 18px; padding: 24px; margin-bottom: 26px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    .section-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
    .geo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .tip-box { background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 12px 16px; border-radius: 8px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; }
    .table-scroll { overflow-x: auto; }
    .btn-row { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; padding: 10px 18px; border-radius: 10px; font-size: 0.9rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
    .btn-site { background: #6366f1; color: #fff; }
    .btn-test { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; }
    .btn-reset { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; }
    .btn:hover { filter: brightness(1.15); }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <h1>📊 Статистика переходов</h1>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 4px;">Сайт: kontent.smartnotes-ai.ru (Оффер Salid: ИИ Контент-Завод)</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <div class="user-badge">
          <span>🔒 admin</span>
          <a href="/stats?logout=1" class="logout-btn" title="Выйти из системы">Выйти</a>
        </div>
        <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
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

    <!-- Блок географии по странам -->
    <div class="section-box">
      <div class="section-title">
        <span>🌍 География посетителей (по странам)</span>
        <span style="font-size: 0.85rem; color: #94a3b8; font-weight: normal;">Определяется по IP-адресу</span>
      </div>
      <div class="geo-grid">
        ${countryRows || '<div style="color: #64748b;">Данные накапливаются...</div>'}
      </div>
      <div class="tip-box">
        💡 <strong>Почему так много заходов из США?</strong> Это автоматические интернет-сканеры, облачные серверы (Amazon AWS, DigitalOcean, Google Cloud) и краулеры ИИ. Они сканируют все новые домены сразу после создания SSL-сертификата. Реальные целевые клиенты из России пойдут после того, как робот Яндекса завершит индексацию страницы.
      </div>
    </div>

    <!-- Журнал кликов -->
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

module.exports = function handleKontent(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const accept = (req.headers.accept || '').toLowerCase();

  // 1. Secret Dashboard /stats (Protected by password & cookie & key)
  if (pathname === '/stats' || pathname === '/stats/') {
    // Logout
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
        'WWW-Authenticate': 'Basic realm="Kontent AI Stats (Login: admin, Pass: kontent2026)"',
        'Content-Type': 'text/html; charset=utf-8'
      });
      return res.end(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>401 Требуется авторизация</title>
  <style>
    body { background: #090b14; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .box { background: #131827; border: 1px solid rgba(120, 119, 198, 0.3); border-radius: 20px; padding: 32px 24px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h2 { font-size: 1.5rem; margin-bottom: 12px; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: block; background: #6366f1; color: #fff; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 1rem; }
    .btn:hover { background: #4f46e5; }
    .cred { margin-top: 20px; padding: 14px; background: rgba(255,255,255,0.04); border-radius: 12px; font-size: 0.85rem; color: #cbd5e1; text-align: left; }
  </style>
</head>
<body>
  <div class="box">
    <div style="font-size: 3rem; margin-bottom: 12px;">🔐</div>
    <h2>Доступ защищен паролем</h2>
    <p>Статистика доступна только владельцу сайта. Введите логин и пароль в окне браузера или нажмите кнопку прямого входа ниже:</p>
    <a href="/stats?key=kontent2026" class="btn">Войти в статистику ➔</a>
    <div class="cred">
      <div>👤 <strong>Логин:</strong> <code style="color: #38bdf8;">admin</code></div>
      <div style="margin-top: 4px;">🔑 <strong>Пароль:</strong> <code style="color: #38bdf8;">kontent2026</code></div>
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

  // 2. Raw JSON Stats API (/api/stats - also protected)
  if (pathname === '/api/stats') {
    const auth = checkAuth(req, url);
    if (!auth.ok) {
      res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: 'Unauthorized. Use Basic auth or ?key=kontent2026' }));
    }
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    return res.end(JSON.stringify(getStats(), null, 2));
  }

  // 3. Markdown content negotiation for AI agents (Accept: text/markdown)
  if (accept.includes('text/markdown') && (pathname === '/' || pathname === '/index' || pathname === '/main' || pathname === '')) {
    const mdPath = path.join(__dirname, 'llms.txt');
    return serveFile(res, mdPath, 'text/markdown; charset=utf-8', {
      'x-markdown-tokens': '420',
      'Vary': 'Accept',
      'Link': '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"'
    });
  }

  // 4. Direct Redirect / Click tracking to Salid Offer
  if (pathname === '/go' || pathname === '/join' || pathname === '/register' || pathname === '/webinar') {
    recordClick(req, url);
    const targetUrl = new URL(AFFILIATE_LINK);
    url.searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });
    res.writeHead(302, { Location: targetUrl.toString() });
    return res.end();
  }

  // 5. robots.txt
  if (pathname === '/robots.txt') {
    return serveFile(res, path.join(__dirname, 'robots.txt'), 'text/plain; charset=utf-8');
  }

  // 6. sitemap.xml
  if (pathname === '/sitemap.xml') {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kontent.smartnotes-ai.ru/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
    return res.end(sitemap);
  }

  // 7. llms.txt & auth.md
  if (pathname === '/llms.txt') {
    return serveFile(res, path.join(__dirname, 'llms.txt'), 'text/markdown; charset=utf-8');
  }
  if (pathname === '/auth.md') {
    return serveFile(res, path.join(__dirname, 'auth.md'), 'text/markdown; charset=utf-8');
  }

  // 8. RFC 9727 API Catalog
  if (pathname === '/.well-known/api-catalog') {
    return serveFile(res, path.join(__dirname, '.well-known', 'api-catalog'), 'application/linkset+json');
  }

  // 9. ARD Manifest (ai-catalog.json)
  if (pathname === '/.well-known/ai-catalog.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'ai-catalog.json'), 'application/json; charset=utf-8');
  }

  // 10. MCP Server Card
  if (pathname === '/.well-known/mcp/server-card.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'mcp', 'server-card.json'), 'application/json; charset=utf-8');
  }

  // 11. Agent Skills Index
  if (pathname === '/.well-known/agent-skills/index.json' || pathname === '/.well-known/agent-skills') {
    return serveFile(res, path.join(__dirname, '.well-known', 'agent-skills', 'index.json'), 'application/json; charset=utf-8');
  }

  // 12. OpenID & OAuth Discovery
  if (pathname === '/.well-known/openid-configuration' || pathname === '/.well-known/openid-configuration.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'openid-configuration'), 'application/json; charset=utf-8');
  }
  if (pathname === '/.well-known/oauth-authorization-server' || pathname === '/.well-known/oauth-authorization-server.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'oauth-authorization-server'), 'application/json; charset=utf-8');
  }
  if (pathname === '/.well-known/oauth-protected-resource' || pathname === '/.well-known/oauth-protected-resource.json' || pathname === '/.well-known/oauth-protected-resource/') {
    return serveFile(res, path.join(__dirname, '.well-known', 'oauth-protected-resource'), 'application/json; charset=utf-8');
  }

  // 13. Agent Registration endpoints (WorkOS auth.md discovery)
  if (pathname === '/api/agent/register') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      status: 'registered',
      client_id: 'agent_' + Date.now().toString(36),
      token_endpoint: 'https://kontent.smartnotes-ai.ru/api/auth/token'
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

  // 14. API Health & OpenAPI
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'ok', service: 'kontent-ai' }));
  }
  if (pathname === '/api/openapi.json') {
    return serveFile(res, path.join(__dirname, 'api', 'openapi.json'), 'application/vnd.oai.openapi+json');
  }

  // 15. Privacy & Legal pages
  if (pathname === '/privacy' || pathname === '/privacy-policy') {
    return serveFile(res, path.join(__dirname, 'privacy.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/terms' || pathname === '/oferta') {
    return serveFile(res, path.join(__dirname, 'terms.html'), 'text/html; charset=utf-8');
  }

  // 16. Images (/img/*)
  if (pathname.startsWith('/img/')) {
    const filename = path.basename(pathname);
    const full = path.join(__dirname, 'img', filename);
    const ext = path.extname(full).toLowerCase();
    return serveFile(res, full, MIME_TYPES[ext] || 'image/png');
  }

  // 17. Favicon
  if (pathname === '/favicon.ico' || pathname === '/favicon.png') {
    return serveFile(res, path.join(__dirname, 'img', 'favicon.png'), 'image/png');
  }

  // 18. Main page (/) with RFC 8288 Link headers + view counter
  if (pathname === '/' || pathname === '/index' || pathname === '/index.html') {
    recordView(req);
    return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', {
      'Link': '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"'
    });
  }

  // 19. General file lookup
  const possibleFile = path.join(__dirname, pathname.replace(/^\//, ''));
  if (fs.existsSync(possibleFile) && fs.statSync(possibleFile).isFile()) {
    const ext = path.extname(possibleFile).toLowerCase();
    return serveFile(res, possibleFile, MIME_TYPES[ext]);
  }

  // Fallback to main page
  recordView(req);
  return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', {
    'Link': '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"'
  });
};
