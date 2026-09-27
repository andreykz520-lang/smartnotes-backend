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

  // 1. Markdown content negotiation for AI agents (Accept: text/markdown)
  if (accept.includes('text/markdown') && (pathname === '/' || pathname === '/index' || pathname === '/main' || pathname === '')) {
    const mdPath = path.join(__dirname, 'llms.txt');
    return serveFile(res, mdPath, 'text/markdown; charset=utf-8', {
      'x-markdown-tokens': '420',
      'Vary': 'Accept',
      'Link': '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"'
    });
  }

  // 2. Direct Redirect / Click tracking to Salid Offer
  if (pathname === '/go' || pathname === '/join' || pathname === '/register' || pathname === '/webinar') {
    const targetUrl = new URL(AFFILIATE_LINK);
    url.searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });
    res.writeHead(302, { Location: targetUrl.toString() });
    return res.end();
  }

  // 3. robots.txt
  if (pathname === '/robots.txt') {
    return serveFile(res, path.join(__dirname, 'robots.txt'), 'text/plain; charset=utf-8');
  }

  // 4. sitemap.xml
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

  // 5. llms.txt & auth.md
  if (pathname === '/llms.txt') {
    return serveFile(res, path.join(__dirname, 'llms.txt'), 'text/markdown; charset=utf-8');
  }
  if (pathname === '/auth.md') {
    return serveFile(res, path.join(__dirname, 'auth.md'), 'text/markdown; charset=utf-8');
  }

  // 6. RFC 9727 API Catalog
  if (pathname === '/.well-known/api-catalog') {
    return serveFile(res, path.join(__dirname, '.well-known', 'api-catalog'), 'application/linkset+json');
  }

  // 7. ARD Manifest (ai-catalog.json)
  if (pathname === '/.well-known/ai-catalog.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'ai-catalog.json'), 'application/json; charset=utf-8');
  }

  // 8. MCP Server Card
  if (pathname === '/.well-known/mcp/server-card.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'mcp', 'server-card.json'), 'application/json; charset=utf-8');
  }

  // 9. Agent Skills Index
  if (pathname === '/.well-known/agent-skills/index.json' || pathname === '/.well-known/agent-skills') {
    return serveFile(res, path.join(__dirname, '.well-known', 'agent-skills', 'index.json'), 'application/json; charset=utf-8');
  }

  // 10. OpenID & OAuth Discovery
  if (pathname === '/.well-known/openid-configuration' || pathname === '/.well-known/openid-configuration.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'openid-configuration'), 'application/json; charset=utf-8');
  }
  if (pathname === '/.well-known/oauth-authorization-server' || pathname === '/.well-known/oauth-authorization-server.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'oauth-authorization-server'), 'application/json; charset=utf-8');
  }
  if (pathname === '/.well-known/oauth-protected-resource' || pathname === '/.well-known/oauth-protected-resource.json' || pathname === '/.well-known/oauth-protected-resource/') {
    return serveFile(res, path.join(__dirname, '.well-known', 'oauth-protected-resource'), 'application/json; charset=utf-8');
  }

  // 11. Agent Registration endpoints (WorkOS auth.md discovery)
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

  // 12. API Health & OpenAPI
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'ok', service: 'kontent-ai' }));
  }
  if (pathname === '/api/openapi.json') {
    return serveFile(res, path.join(__dirname, 'api', 'openapi.json'), 'application/vnd.oai.openapi+json');
  }

  // 13. Privacy & Legal pages
  if (pathname === '/privacy' || pathname === '/privacy-policy') {
    return serveFile(res, path.join(__dirname, 'privacy.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/terms' || pathname === '/oferta') {
    return serveFile(res, path.join(__dirname, 'terms.html'), 'text/html; charset=utf-8');
  }

  // 14. Images (/img/*)
  if (pathname.startsWith('/img/')) {
    const filename = path.basename(pathname);
    const full = path.join(__dirname, 'img', filename);
    const ext = path.extname(full).toLowerCase();
    return serveFile(res, full, MIME_TYPES[ext] || 'image/png');
  }

  // 15. Favicon
  if (pathname === '/favicon.ico' || pathname === '/favicon.png') {
    return serveFile(res, path.join(__dirname, 'img', 'favicon.png'), 'image/png');
  }

  // 16. Main page (/) with RFC 8288 Link headers for agent discovery
  if (pathname === '/' || pathname === '/index' || pathname === '/index.html') {
    return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', {
      'Link': '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"'
    });
  }

  // 17. General file lookup
  const possibleFile = path.join(__dirname, pathname.replace(/^\//, ''));
  if (fs.existsSync(possibleFile) && fs.statSync(possibleFile).isFile()) {
    const ext = path.extname(possibleFile).toLowerCase();
    return serveFile(res, possibleFile, MIME_TYPES[ext]);
  }

  // Fallback to main page with Link header
  return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', {
    'Link': '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"'
  });
};
