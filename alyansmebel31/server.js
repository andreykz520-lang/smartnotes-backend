const fs = require('fs');
const path = require('path');

const LINK_HEADERS = '</.well-known/api-catalog>; rel="api-catalog", </.well-known/ai-catalog.json>; rel="service-desc", </llms.txt>; rel="service-doc", </llms.txt>; rel="describedby", </auth.md>; rel="authorizing-agent"';

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
  '.md': 'text/markdown; charset=utf-8'
};

const LEADS_FILE = path.join(__dirname, 'leads.json');

function saveLead(lead) {
  let leads = [];
  try {
    if (fs.existsSync(LEADS_FILE)) {
      leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    }
  } catch (e) {
    leads = [];
  }
  leads.unshift({
    id: Date.now().toString(36),
    createdAt: new Date().toISOString(),
    ...lead
  });
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (e) {
    console.error('[AlyansMebel] Error saving lead:', e);
  }
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

  // 1. Favicon
  if (pathname === '/favicon.ico' || pathname === '/favicon.png') {
    const ico = path.join(__dirname, 'images', 'building.jpg');
    return serveFile(res, ico, 'image/jpeg');
  }

  // 2. robots.txt
  if (pathname === '/robots.txt') {
    return serveFile(res, path.join(__dirname, 'robots.txt'), 'text/plain; charset=utf-8');
  }

  // 3. sitemap.xml
  if (pathname === '/sitemap.xml') {
    return serveFile(res, path.join(__dirname, 'sitemap.xml'), 'application/xml; charset=utf-8');
  }

  // 4. Markdown for Agents content negotiation (Accept: text/markdown)
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

  // 5. llms.txt & auth.md
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

  // 6. RFC 9727 API Catalog
  if (pathname === '/.well-known/api-catalog' || pathname === '/.well-known/api-catalog.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'api-catalog'), 'application/linkset+json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 7. ARD Manifest (ai-catalog.json)
  if (pathname === '/.well-known/ai-catalog.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'ai-catalog.json'), 'application/json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 8. SEP-1649 MCP Server Card
  if (pathname === '/.well-known/mcp/server-card.json') {
    return serveFile(res, path.join(__dirname, '.well-known', 'mcp', 'server-card.json'), 'application/json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 9. Agent Skills Index (Cloudflare RFC)
  if (pathname === '/.well-known/agent-skills/index.json' || pathname === '/.well-known/agent-skills') {
    return serveFile(res, path.join(__dirname, '.well-known', 'agent-skills', 'index.json'), 'application/json; charset=utf-8', {
      'Link': LINK_HEADERS
    });
  }

  // 10. OpenID & OAuth 2.0 Discovery
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

  // 11. API Health & OpenAPI
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

  // 12. Agent Registration Endpoints (WorkOS / auth.md)
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

  // 13. Lead submission API (/api/lead)
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
        saveLead({
          name: data.name || '',
          phone: data.phone.trim(),
          category: data.category || data.furniture || '',
          comment: data.comment || data.style || '',
          source: data.source || 'website',
          ip
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

  // 14. Main Page (HTML with Link header and Vary: Accept)
  if (pathname === '/' || pathname === '/index' || pathname === '/index.html' || pathname === '') {
    return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', {
      'Link': LINK_HEADERS,
      'Vary': 'Accept'
    });
  }

  // 15. Static assets (css, js, images, etc.)
  const safePath = pathname.replace(/^\/+/, '');
  const possibleFile = path.join(__dirname, safePath);

  // Prevent directory traversal
  if (possibleFile.startsWith(__dirname) && fs.existsSync(possibleFile) && fs.statSync(possibleFile).isFile()) {
    const ext = path.extname(possibleFile).toLowerCase();
    const extraHeaders = (ext === '.html' || ext === '.md') ? { 'Link': LINK_HEADERS, 'Vary': 'Accept' } : {};
    return serveFile(res, possibleFile, MIME_TYPES[ext] || 'application/octet-stream', extraHeaders);
  }

  // 16. Fallback to index.html with Link headers
  return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8', {
    'Link': LINK_HEADERS,
    'Vary': 'Accept'
  });
};
