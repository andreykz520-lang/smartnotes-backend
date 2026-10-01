const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// RFC 8288 Link Headers for Agent Discovery
const LINK_HEADERS = '</.well-known/api-catalog>; rel="api-catalog", </.well-known/ai-catalog.json>; rel="service-desc", </llms.txt>; rel="service-doc", </llms.txt>; rel="describedby", </auth.md>; rel="authorizing-agent"';

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
const chatApi = require('./api/chat');
const { recordObd2Visitor } = require('./obd2-tracker');

const handleObd2 = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Record visitor traffic
  if (req.method === 'GET') {
    recordObd2Visitor(req, pathname);
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
      if (pathname === '/api/health') {
        res.setHeader('Link', LINK_HEADERS);
        return res.json({ status: 'ok', service: 'OBD2 SCAN AI', timestamp: new Date().toISOString() });
      }
      if (pathname === '/api/bot') return await botApi(req, res);
      if (pathname === '/api/chat') return await chatApi(req, res);
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

    // Markdown content negotiation (Accept: text/markdown)
    const acceptHeader = (req.headers['accept'] || '').toLowerCase();
    const wantsMarkdown = acceptHeader.includes('text/markdown');

    if (wantsMarkdown) {
      if (pathname === '/' || pathname === '/index' || pathname === '/main') {
        const llmsPath = path.join(__dirname, 'public', 'llms.txt');
        const mdText = fs.existsSync(llmsPath) ? fs.readFileSync(llmsPath, 'utf-8') : '# OBD2 SCAN AI\n\nAI-powered vehicle diagnostics.';
        const tokenCount = Math.ceil(Buffer.byteLength(mdText, 'utf-8') / 3.5);
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Vary', 'Accept');
        res.setHeader('x-markdown-tokens', String(tokenCount));
        res.setHeader('Link', LINK_HEADERS);
        res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
        res.setHeader('Content-Length', Buffer.byteLength(mdText, 'utf-8'));
        return res.end(mdText, 'utf-8');
      }
      if (pathname === '/testers' || pathname === '/tester' || pathname === '/beta' || pathname === '/club') {
        const testersMdPath = path.join(__dirname, 'public', 'testers.md');
        let mdText = '';
        if (fs.existsSync(testersMdPath)) {
          mdText = fs.readFileSync(testersMdPath, 'utf-8');
        } else {
          mdText = '# Клуб Тестеров OBD2 SCAN AI\n\nТестируйте приложение и получите 2 PRO лицензии: OBD2 SCAN AI + SmartNotes AI!';
        }
        const tokenCount = Math.ceil(Buffer.byteLength(mdText, 'utf-8') / 3.5);
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Vary', 'Accept');
        res.setHeader('x-markdown-tokens', String(tokenCount));
        res.setHeader('Link', LINK_HEADERS);
        res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
        res.setHeader('Content-Length', Buffer.byteLength(mdText, 'utf-8'));
        return res.end(mdText, 'utf-8');
      }
    }

    // Static HTML and asset routes
    let filePath = '';
    if (pathname === '/' || pathname === '/index' || pathname === '/main') {
      filePath = path.join(__dirname, 'public', 'index.html');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'index.html');
    } else if (pathname === '/download' || pathname === '/download-apk' || pathname === '/apk') {
      filePath = path.join(__dirname, 'public', 'obd2scanai.apk');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'obd2scanai.apk');
    } else if (pathname === '/download-windows' || pathname === '/download-win' || pathname === '/windows' || pathname === '/win' || pathname === '/exe') {
      filePath = path.join(__dirname, 'public', 'OBD2_SCAN_AI_Setup.exe');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'obd2scanai-windows.exe');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'public', 'obd2scanai-windows.zip');
    } else if (pathname === '/buy') {
      filePath = path.join(__dirname, 'public', 'buy.html');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'buy.html');
    } else if (pathname === '/admin') {
      filePath = path.join(__dirname, 'public', 'admin.html');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'admin.html');
    } else if (pathname === '/testers' || pathname === '/tester' || pathname === '/beta' || pathname === '/club') {
      filePath = path.join(__dirname, 'public', 'testers.html');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'testers.html');
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
        '.json': 'application/json; charset=utf-8',
        '.md': 'text/markdown; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon',
        '.svg': 'image/svg+xml',
        '.xml': 'application/xml; charset=utf-8',
        '.txt': 'text/plain; charset=utf-8',
        '.apk': 'application/vnd.android.package-archive',
        '.zip': 'application/zip',
        '.exe': 'application/x-msdownload'
      };

      let contentType = mimeTypes[ext] || 'application/octet-stream';
      if (pathname.endsWith('/api-catalog')) {
        contentType = 'application/linkset+json; charset=utf-8';
      } else if (pathname.endsWith('llms.txt')) {
        contentType = 'text/markdown; charset=utf-8';
      } else if (pathname.includes('/.well-known/') && !ext) {
        contentType = 'application/json; charset=utf-8';
      }
      res.setHeader('Content-Type', contentType);

      if (ext === '.apk') {
        res.setHeader('Content-Disposition', 'attachment; filename="OBD2_SCAN_AI.apk"');
      } else if (ext === '.exe') {
        res.setHeader('Content-Disposition', 'attachment; filename="OBD2_SCAN_AI_Setup.exe"');
      } else if (ext === '.zip') {
        res.setHeader('Content-Disposition', 'attachment; filename="OBD2_SCAN_AI_Windows.zip"');
      }

      if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp' || ext === '.ico' || ext === '.svg') {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
      }

      // RFC 8288 Link header and Vary on HTML, Markdown, API Catalog, and discovery files
      if (ext === '.html' || ext === '.md' || pathname === '/' || pathname === '/index' || pathname === '/testers' || pathname.includes('/.well-known/') || pathname.endsWith('llms.txt')) {
        res.setHeader('Link', LINK_HEADERS);
        res.setHeader('Vary', 'Accept');
      }
      
      if (ext === '.html' || ext === '.css' || ext === '.js' || ext === '.md' || ext === '.json' || ext === '.xml' || ext === '.txt' || pathname.includes('/.well-known/')) {
        const text = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Length', Buffer.byteLength(text, 'utf-8'));
        return res.end(text, 'utf-8');
      } else {
        const data = fs.readFileSync(filePath);
        res.setHeader('Content-Length', data.length);
        return res.end(data);
      }
    }

    res.status(404).send('Not Found');
  });
};

module.exports = handleObd2;

if (require.main === module) {
  const server = http.createServer(handleObd2);
  server.listen(PORT, () => {
    console.log(`OBD2 SCAN AI Server running on http://localhost:${PORT}`);
  });
}
