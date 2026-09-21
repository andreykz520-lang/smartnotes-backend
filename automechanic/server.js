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
  '.apk': 'application/vnd.android.package-archive',
  '.exe': 'application/octet-stream',
  '.zip': 'application/zip',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

function serveFile(res, filePath, contentType, isDownload = false, downloadName = '', extraHeaders = {}) {
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

  if (isDownload) {
    headers['Content-Disposition'] = `attachment; filename="${downloadName || path.basename(filePath)}"`;
    headers['Cache-Control'] = 'no-cache';
  } else if (filePath.includes('static') || filePath.includes('screenshots') || filePath.endsWith('.png') || filePath.endsWith('.ico')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else {
    headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate';
  }

  res.writeHead(200, headers);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}

module.exports = function handleAutomechanic(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const accept = (req.headers.accept || '').toLowerCase();

  // 1. AI Content / Markdown Negotiation (Accept: text/markdown)
  if (accept.includes('text/markdown') && (pathname === '/' || pathname === '/index' || pathname === '/main' || pathname === '')) {
    const mdPath = path.join(__dirname, 'public', 'llms.txt');
    return serveFile(res, mdPath, 'text/markdown; charset=utf-8', false, '', {
      'x-markdown-tokens': '380',
      'Vary': 'Accept',
      'Link': '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"'
    });
  }

  // 2. robots.txt
  if (pathname === '/robots.txt') {
    return serveFile(res, path.join(__dirname, 'public', 'robots.txt'), 'text/plain; charset=utf-8');
  }

  // 3. sitemap.xml
  if (pathname === '/sitemap.xml') {
    return serveFile(res, path.join(__dirname, 'public', 'sitemap.xml'), 'application/xml; charset=utf-8');
  }

  // 4. llms.txt & auth.md
  if (pathname === '/llms.txt') {
    return serveFile(res, path.join(__dirname, 'public', 'llms.txt'), 'text/markdown; charset=utf-8');
  }
  if (pathname === '/auth.md') {
    return serveFile(res, path.join(__dirname, 'public', 'auth.md'), 'text/markdown; charset=utf-8');
  }

  // 5. RFC 9727 API Catalog
  if (pathname === '/.well-known/api-catalog') {
    return serveFile(res, path.join(__dirname, 'public', '.well-known', 'api-catalog'), 'application/linkset+json');
  }

  // 6. ARD Manifest (ai-catalog.json)
  if (pathname === '/.well-known/ai-catalog.json') {
    return serveFile(res, path.join(__dirname, 'public', '.well-known', 'ai-catalog.json'), 'application/json');
  }

  // 7. MCP Server Card
  if (pathname === '/.well-known/mcp/server-card.json') {
    return serveFile(res, path.join(__dirname, 'public', '.well-known', 'mcp', 'server-card.json'), 'application/json');
  }

  // 8. Agent Skills Index
  if (pathname === '/.well-known/agent-skills/index.json' || pathname === '/.well-known/agent-skills') {
    return serveFile(res, path.join(__dirname, 'public', '.well-known', 'agent-skills', 'index.json'), 'application/json');
  }

  // 9. OpenID & OAuth Discovery
  if (pathname === '/.well-known/openid-configuration' || pathname === '/.well-known/openid-configuration.json') {
    return serveFile(res, path.join(__dirname, 'public', '.well-known', 'openid-configuration'), 'application/json; charset=utf-8');
  }
  if (pathname === '/.well-known/oauth-authorization-server' || pathname === '/.well-known/oauth-authorization-server.json') {
    return serveFile(res, path.join(__dirname, 'public', '.well-known', 'oauth-authorization-server'), 'application/json; charset=utf-8');
  }
  if (pathname === '/.well-known/oauth-protected-resource' || pathname === '/.well-known/oauth-protected-resource.json' || pathname === '/.well-known/oauth-protected-resource/') {
    return serveFile(res, path.join(__dirname, 'public', '.well-known', 'oauth-protected-resource'), 'application/json; charset=utf-8');
  }

  // 10. Agent Registration & Auth endpoints (WorkOS auth.md discovery)
  if (pathname === '/api/agent/register') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      status: 'registered',
      client_id: 'agent_' + Date.now().toString(36),
      token_endpoint: 'https://automechanic.obd2scanai.ru/api/auth/token'
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

  // 11. API Health and OpenAPI spec
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'ok', service: 'automechanic-ai' }));
  }
  if (pathname === '/api/openapi.json') {
    return serveFile(res, path.join(__dirname, 'public', 'api', 'openapi.json'), 'application/vnd.oai.openapi+json');
  }

  // Перенаправление со страниц оплаты на блок скачивания
  if (pathname === '/buy' || pathname === '/buy-pro' || pathname.startsWith('/buy')) {
    res.writeHead(302, { Location: '/#download' });
    return res.end();
  }

  // API для мобильного приложения: статус лицензии
  if (pathname === '/api/license/check') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      email: url.searchParams.get('email') || 'tester@automechanic.ru',
      isPro: true,
      isProPlus: true,
      proEndedAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      daysLeft: 365,
      message: 'Тестовый бесплатный режим AutoMechanic AI'
    }));
  }

  // Главная страница с заголовками обнаружения агентов (RFC 8288 Link)
  if (pathname === '/' || pathname === '/index' || pathname === '/main') {
    return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', false, '', {
      'Link': '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"'
    });
  }

  // Статические страницы
  if (pathname === '/privacy') {
    return serveFile(res, path.join(__dirname, 'privacy.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/terms') {
    return serveFile(res, path.join(__dirname, 'terms.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/refund') {
    return serveFile(res, path.join(__dirname, 'refund.html'), 'text/html; charset=utf-8');
  }

  // Скачивание дистрибутивов
  if (pathname === '/AutoMechanic-v1.0.apk' || pathname === '/download-apk' || pathname === '/apk') {
    return serveFile(
      res,
      path.join(__dirname, 'public', 'AutoMechanic-v1.0.apk'),
      'application/vnd.android.package-archive',
      true,
      'AutoMechanic-v1.0.apk'
    );
  }

  if (pathname === '/AutoMechanic-AI-Setup.exe' || pathname === '/download-windows' || pathname === '/download-win' || pathname === '/exe') {
    return serveFile(
      res,
      path.join(__dirname, 'public', 'AutoMechanic-AI-Setup.exe'),
      'application/octet-stream',
      true,
      'AutoMechanic-AI-Setup.exe'
    );
  }

  // Статические файлы Next.js (_next/static/*)
  if (pathname.startsWith('/_next/static/')) {
    const sub = pathname.replace('/_next/static/', '');
    const full = path.join(__dirname, 'static', sub);
    const ext = path.extname(full).toLowerCase();
    return serveFile(res, full, MIME_TYPES[ext] || 'application/octet-stream');
  }

  // Скриншоты (/screenshots/*)
  if (pathname.startsWith('/screenshots/')) {
    const filename = path.basename(pathname);
    const full = path.join(__dirname, 'public', 'screenshots', filename);
    const ext = path.extname(full).toLowerCase();
    return serveFile(res, full, MIME_TYPES[ext] || 'image/jpeg');
  }

  // Иконки и фавикон
  if (pathname === '/favicon.ico' || pathname === '/icon.png') {
    const full = path.join(__dirname, 'public', pathname.slice(1));
    const ext = path.extname(full).toLowerCase();
    return serveFile(res, full, MIME_TYPES[ext]);
  }

  // Общий поиск в public/
  const possiblePublic = path.join(__dirname, 'public', pathname.replace(/^\//, ''));
  if (fs.existsSync(possiblePublic) && fs.statSync(possiblePublic).isFile()) {
    const ext = path.extname(possiblePublic).toLowerCase();
    return serveFile(res, possiblePublic, MIME_TYPES[ext]);
  }

  // 404 fallback: отдаем главную страницу
  return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8');
};
