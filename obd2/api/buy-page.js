// Vercel Serverless Compatibility Wrapper
function compatMiddleware(res) {
  if (!res.status) res.status = function(code) { this.statusCode = code; return this; };
  if (!res.json) res.json = function(data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
  };
  if (!res.send) res.send = function(data) { this.end(data); };
}
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  compatMiddleware(res);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  let filePath = path.join(__dirname, '..', 'public', 'buy.html');
  if (!fs.existsSync(filePath)) filePath = path.join(__dirname, '..', 'buy.html');
  if (!fs.existsSync(filePath)) filePath = path.join(__dirname, 'buy.html');
  
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf8');
    return res.status(200).send(html);
  }
  return res.status(404).send('Page not found');
};
