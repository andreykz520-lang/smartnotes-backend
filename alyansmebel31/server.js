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
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function serveFile(res, filePath, contentType, extraHeaders = {}) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Not Found');
  }

  const stat = fs.statSync(filePath);
  const headers = {
    'Content-Type': contentType || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': filePath.endsWith('.html') ? 'no-cache' : 'public, max-age=86400',
    ...extraHeaders
  };

  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

module.exports = function handleAlyansMebel(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  // 1. Favicon
  if (pathname === '/favicon.ico' || pathname === '/favicon.png') {
    const ico = path.join(__dirname, 'images', 'building.jpg');
    return serveFile(res, ico, 'image/jpeg');
  }

  // 2. Robots.txt
  if (pathname === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end("User-agent: *\nAllow: /\nSitemap: https://alyansmebel31.ru/sitemap.xml\n");
  }

  // 3. Main Page
  if (pathname === '/' || pathname === '/index' || pathname === '/index.html' || pathname === '') {
    return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8');
  }

  // 4. Static assets (css, js, images)
  const safePath = pathname.replace(/^\/+/, '');
  const possibleFile = path.join(__dirname, safePath);

  // Prevent directory traversal
  if (possibleFile.startsWith(__dirname) && fs.existsSync(possibleFile) && fs.statSync(possibleFile).isFile()) {
    const ext = path.extname(possibleFile).toLowerCase();
    return serveFile(res, possibleFile, MIME_TYPES[ext] || 'application/octet-stream');
  }

  // 5. Fallback to index.html for SPA/landing navigation
  return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8');
};
