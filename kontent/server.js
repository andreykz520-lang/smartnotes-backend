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

const AFFILIATE_LINK = 'https://kurs-vebinar.ru/2777344';
const STATS_FILE = path.join(__dirname, 'stats.json');

function getStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { views: 0, clicks: 0, lastView: null, lastClick: null, recentClicks: [] };
}

function saveStats(stats) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {}
}

function recordView(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) return;
  const stats = getStats();
  stats.views = (stats.views || 0) + 1;
  stats.lastView = new Date().toISOString();
  saveStats(stats);
}

function recordClick(req, url) {
  const stats = getStats();
  stats.clicks = (stats.clicks || 0) + 1;
  stats.lastClick = new Date().toISOString();
  if (!stats.recentClicks) stats.recentClicks = [];

  const utmSource = url.searchParams.get('utm_source') || '';
  const utmCampaign = url.searchParams.get('utm_campaign') || '';
  const utmMedium = url.searchParams.get('utm_medium') || '';
  const ref = req.headers['referer'] || '';

  let utmLabel = 'Прямой клик на сайте';
  if (utmSource || utmCampaign) {
    utmLabel = `${utmSource || '—'} / ${utmMedium || '—'} (${utmCampaign || '—'})`;
  }

  stats.recentClicks.unshift({
    time: new Date().toISOString(),
    utm: utmLabel,
    ip: (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim()
  });

  if (stats.recentClicks.length > 50) {
    stats.recentClicks = stats.recentClicks.slice(0, 50);
  }
  saveStats(stats);
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

function renderStatsHtml(stats) {
  const views = stats.views || 0;
  const clicks = stats.clicks || 0;
  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
  const recentRows = (stats.recentClicks || []).map((c, i) => `
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #94a3b8;">#${i + 1}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); font-variant-numeric: tabular-nums;">${formatMskDate(c.time)}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #38bdf8;">${c.utm}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: monospace; color: #a5b4fc;">${c.ip || '—'}</td>
    </tr>
  `).join('');

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
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: gap; }
    h1 { font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, #fff 40%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .refresh-badge { background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 30px; }
    .card { background: rgba(18, 22, 38, 0.8); border: 1px solid rgba(120, 119, 198, 0.25); border-radius: 18px; padding: 22px; backdrop-filter: blur(12px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    .card-title { font-size: 0.85rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
    .card-val { font-size: 2.2rem; font-weight: 900; color: #fff; }
    .card-sub { font-size: 0.8rem; color: #64748b; margin-top: 6px; }
    .val-clicks { color: #38bdf8; }
    .val-ctr { color: #34d399; }
    .table-box { background: rgba(18, 22, 38, 0.8); border: 1px solid rgba(120, 119, 198, 0.25); border-radius: 18px; padding: 24px; overflow-x: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; }
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
      <div class="refresh-badge">⚡ Автообновление каждые 15 сек</div>
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

    <div class="table-box">
      <h3 style="font-size: 1.1rem; margin-bottom: 16px;">Журнал последних кликов (переходов в Salid)</h3>
      ${recentRows ? `
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Время (МСК)</th>
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

  // 1. Secret Dashboard /stats
  if (pathname === '/stats' || pathname === '/stats/') {
    if (url.searchParams.get('reset') === '1') {
      saveStats({ views: 0, clicks: 0, lastView: null, lastClick: null, recentClicks: [] });
      res.writeHead(302, { Location: '/stats' });
      return res.end();
    }
    const stats = getStats();
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    return res.end(renderStatsHtml(stats));
  }

  // 2. Raw JSON Stats API (/api/stats)
  if (pathname === '/api/stats') {
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
