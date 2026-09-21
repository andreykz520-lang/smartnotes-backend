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
  '.ttf': 'font/ttf'
};

function serveFile(res, filePath, contentType, isDownload = false, downloadName = '') {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('File Not Found');
  }

  const stat = fs.statSync(filePath);
  const headers = {
    'Content-Type': contentType || 'application/octet-stream',
    'Content-Length': stat.size,
    'Access-Control-Allow-Origin': '*'
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

  // Перенаправление со страниц оплаты на главную страницу к блоку скачивания
  if (pathname === '/buy' || pathname === '/buy-pro' || pathname.startsWith('/buy')) {
    res.writeHead(302, { Location: '/#download' });
    return res.end();
  }

  // API для мобильного приложения: статус лицензии (во время теста всегда PRO)
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

  // Главная страница
  if (pathname === '/' || pathname === '/index' || pathname === '/main') {
    return serveFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8');
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

  if (pathname === '/AutoMechanic-AI-Windows.zip' || pathname === '/windows-zip') {
    const zipPath = path.join(__dirname, 'public', 'AutoMechanic-AI-Windows.zip');
    if (fs.existsSync(zipPath)) {
      return serveFile(res, zipPath, 'application/zip', true, 'AutoMechanic-AI-Windows.zip');
    }
    // Если zip отсутствует, отдаем exe установщик
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
