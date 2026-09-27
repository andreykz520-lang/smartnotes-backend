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

  // 1. Direct Redirect / Click tracking to Salid Offer
  if (pathname === '/go' || pathname === '/join' || pathname === '/register' || pathname === '/webinar') {
    const targetUrl = new URL(AFFILIATE_LINK);
    url.searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });
    res.writeHead(302, { Location: targetUrl.toString() });
    return res.end();
  }

  // 2. robots.txt
  if (pathname === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end("User-agent: *\nAllow: /\nSitemap: https://kontent.smartnotes-ai.ru/sitemap.xml\n");
  }

  // 3. sitemap.xml
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

  // 4. Privacy & Legal pages
  if (pathname === '/privacy' || pathname === '/privacy-policy') {
    return serveFile(res, path.join(__dirname, 'privacy.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/terms' || pathname === '/oferta') {
    return serveFile(res, path.join(__dirname, 'terms.html'), 'text/html; charset=utf-8');
  }

  // 5. Images (/img/*)
  if (pathname.startsWith('/img/')) {
    const filename = path.basename(pathname);
    const full = path.join(__dirname, 'img', filename);
    const ext = path.extname(full).toLowerCase();
    return serveFile(res, full, MIME_TYPES[ext] || 'image/png');
  }

  // 6. Favicon
  if (pathname === '/favicon.ico' || pathname === '/favicon.png') {
    return serveFile(res, path.join(__dirname, 'img', 'favicon.png'), 'image/png');
  }

  // 7. Main page (/)
  if (pathname === '/' || pathname === '/index' || pathname === '/index.html') {
    return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8');
  }

  // 8. General file lookup
  const possibleFile = path.join(__dirname, pathname.replace(/^\//, ''));
  if (fs.existsSync(possibleFile) && fs.statSync(possibleFile).isFile()) {
    const ext = path.extname(possibleFile).toLowerCase();
    return serveFile(res, possibleFile, MIME_TYPES[ext]);
  }

  // 404 Fallback to index.html
  return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8');
};
