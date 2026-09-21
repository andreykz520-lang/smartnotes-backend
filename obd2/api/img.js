const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const name = req.query.name || (req.url.includes('?') ? req.url.split('?')[0].split('/').pop() : req.url.split('/').pop());
  const safeName = path.basename(name);
  
  let imgPath = path.join(__dirname, '..', 'public', 'img', safeName);
  if (!fs.existsSync(imgPath)) {
    imgPath = path.join(__dirname, '..', 'img', safeName);
  }

  if (!fs.existsSync(imgPath)) {
    return res.status(404).send('Image Not Found');
  }

  const ext = path.extname(safeName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const buffer = fs.readFileSync(imgPath);
  res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Content-Length', buffer.length);
  return res.status(200).end(buffer);
};
