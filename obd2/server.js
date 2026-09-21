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
  const pathname = url.pathname;

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
    } else if (pathname === '/download' || pathname === '/download-apk' || pathname === '/apk') {
      filePath = path.join(__dirname, 'public', 'obd2scanai.apk');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'obd2scanai.apk');
    } else if (pathname === '/download-windows' || pathname === '/download-win' || pathname === '/windows' || pathname === '/win' || pathname === '/exe') {
      filePath = path.join(__dirname, 'public', 'OBD2_SCAN_AI_Setup.exe');
      if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'obd2scanai-windows.exe');
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
        '.exe': 'application/x-msdownload'
      };
      res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
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
      
      if (ext === '.html' || ext === '.css' || ext === '.js') {
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
}

module.exports = handleObd2;

if (require.main === module) {
  const server = http.createServer(handleObd2);
  server.listen(PORT, () => {
    console.log(`OBD2 SCAN AI Server running on http://localhost:${PORT}`);
  });
}
