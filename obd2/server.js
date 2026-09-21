const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.OBD2_PORT || 3002;

// Import serverless API handlers
const adminApi = require('./api/admin');
const payApi = require('./api/pay');
const activateApi = require('./api/activate');
const trialApi = require('./api/trial');
const trialOtpApi = require('./api/trial-otp');
const verifyTrialOtpApi = require('./api/verify-trial-otp');
const verifyApi = require('./api/verify');
const recoverApi = require('./api/recover');
const botApi = require('./api/bot');
const imgApi = require('./api/img');
const proxyOpenRouterApi = require('./api/proxy-openrouter');

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
  } else if (filePath.includes('img') || filePath.endsWith('.png') || filePath.endsWith('.ico') || filePath.endsWith('.webp')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else {
    headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate';
  }

  res.writeHead(200, headers);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}

function handleObd2(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
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
    return serveFile(res, path.join(__dirname, 'public', '.well-known', 'ai-catalog.json'), 'application/json; charset=utf-8');
  }

  // 7. MCP Server Card
  if (pathname === '/.well-known/mcp/server-card.json') {
    return serveFile(res, path.join(__dirname, 'public', '.well-known', 'mcp', 'server-card.json'), 'application/json; charset=utf-8');
  }

  // 8. Agent Skills Index
  if (pathname === '/.well-known/agent-skills/index.json' || pathname === '/.well-known/agent-skills') {
    return serveFile(res, path.join(__dirname, 'public', '.well-known', 'agent-skills', 'index.json'), 'application/json; charset=utf-8');
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

  // 10. Agent Registration endpoints (WorkOS auth.md discovery)
  if (pathname === '/api/agent/register') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      status: 'registered',
      client_id: 'agent_' + Date.now().toString(36),
      token_endpoint: 'https://obd2scanai.ru/api/auth/token'
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
    return res.end(JSON.stringify({ status: 'ok', service: 'obd2-scan-ai' }));
  }
  if (pathname === '/api/openapi.json') {
    return serveFile(res, path.join(__dirname, 'public', 'api', 'openapi.json'), 'application/vnd.oai.openapi+json');
  }

  // Add express/vercel-like helpers
  req.query = Object.fromEntries(url.searchParams);
  res.status = function(code) {
    res.statusCode = code;
    return this;
  };
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  };
  res.send = function(data) {
    res.end(data);
  };

  // Collect request body for POST/PUT/DELETE
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', async () => {
    const rawBody = Buffer.concat(chunks).toString('utf-8');
    if (rawBody) {
      try {
        req.body = JSON.parse(rawBody);
      } catch (e) {
        try {
          req.body = Object.fromEntries(new URLSearchParams(rawBody));
        } catch (err) {
          req.body = {};
        }
      }
    } else {
      req.body = {};
    }

    // Route API requests
    try {
      if (pathname === '/api/bot') return await botApi(req, res);
      if (pathname === '/api/admin') return await adminApi(req, res);
      if (pathname === '/api/pay') return await payApi(req, res);
      if (pathname === '/api/activate') return await activateApi(req, res);
      if (pathname === '/api/trial') return await trialApi(req, res);
      if (pathname === '/api/trial-otp') return await trialOtpApi(req, res);
      if (pathname === '/api/verify-trial-otp') return await verifyTrialOtpApi(req, res);
      if (pathname === '/api/verify') return await verifyApi(req, res);
      if (pathname === '/api/recover') return await recoverApi(req, res);
      if (pathname === '/api/img') return await imgApi(req, res);
      if (pathname === '/api/proxy/openrouter' || pathname.startsWith('/api/proxy/openrouter') || pathname === '/api/proxy-openrouter') {
        return await proxyOpenRouterApi(req, res);
      }
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: err.message });
    }

    // Static HTML and asset routes
    let filePath = '';
    if (pathname === '/' || pathname === '/index' || pathname === '/main') {
      filePath = path.join(__dirname, 'public', 'index.html');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'index.html');
      return serveFile(res, filePath, 'text/html; charset=utf-8', false, '', {
        'Link': '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"'
      });
    } else if (pathname === '/download' || pathname === '/download-apk' || pathname === '/apk') {
      filePath = path.join(__dirname, 'public', 'obd2scanai.apk');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'obd2scanai.apk');
      return serveFile(res, filePath, 'application/vnd.android.package-archive', true, 'OBD2_SCAN_AI.apk');
    } else if (pathname === '/download-windows' || pathname === '/download-win' || pathname === '/windows' || pathname === '/win' || pathname === '/exe') {
      filePath = path.join(__dirname, 'public', 'OBD2_SCAN_AI_Setup.exe');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'obd2scanai-windows.exe');
      return serveFile(res, filePath, 'application/octet-stream', true, 'OBD2_SCAN_AI_Setup.exe');
    } else if (pathname === '/buy' || pathname === '/buy-pro') {
      res.writeHead(302, { Location: '/' });
      return res.end();
    } else if (pathname === '/admin') {
      filePath = path.join(__dirname, 'public', 'admin.html');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'admin.html');
    } else if (pathname === '/privacy' || pathname === '/privacy-policy') {
      filePath = path.join(__dirname, 'public', 'privacy.html');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'privacy.html');
    } else if (pathname === '/terms' || pathname === '/oferta') {
      filePath = path.join(__dirname, 'public', 'terms.html');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'terms.html');
    } else if (pathname === '/refund' || pathname === '/payment-terms' || pathname === '/returns') {
      filePath = path.join(__dirname, 'public', 'refund.html');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'refund.html');
    } else {
      filePath = path.join(__dirname, 'public', pathname);
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, pathname);
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon',
        '.svg': 'image/svg+xml',
        '.apk': 'application/vnd.android.package-archive',
        '.zip': 'application/zip',
        '.exe': 'application/octet-stream'
      };
      return serveFile(res, filePath, mimeTypes[ext] || 'application/octet-stream');
    }

    res.status(404).send('Not Found');
  });
}

module.exports = handleObd2;

if (require.main === module) {
  const server = http.createServer(handleObd2);
  server.listen(PORT, () => {
    console.log(`OBD2 SCAN AI Server running on http://localhost:${PORT}`);
  });
}
