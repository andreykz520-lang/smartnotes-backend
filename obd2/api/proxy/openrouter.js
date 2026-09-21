// Secure OpenRouter AI Proxy for OBD2 SCAN AI (PRO+)
const MASTER_KEY_B64 = "c2stb3ItdjEtM2VjZjJkZDVhN2MyNzliYWY4ZDE1Y2M4MzJhMWJjN2UxOThkYTM0NWU0NTc3ZjY5Yzc4MDViMzk2MzllNDdhOQ==";

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, HTTP-Referer, X-Title');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    let apiKey = authHeader.replace(/^Bearer\s+/i, '').trim();

    // If user has not provided their own personal key, use the master server-side key
    if (!apiKey || apiKey === 'null' || apiKey === 'undefined' || apiKey === 'VIP-KEY-OBD2' || apiKey.length < 10) {
      apiKey = process.env.OPENROUTER_API_KEY || Buffer.from(MASTER_KEY_B64, 'base64').toString('utf-8');
    }

    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    // Default to google/gemini-3.7-flash if missing or contains typo
    let model = body.model || 'google/gemini-3.7-flash';
    if (model.includes('3.7') || model.includes('gemeni') || !model.includes('/')) {
      model = 'google/gemini-3.7-flash';
    }
    body.model = model;

    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

    const response = await fetch(openRouterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://obd2scanai.ru',
        'X-Title': 'OBD2 SCAN AI'
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { raw: responseText };
    }

    res.statusCode = response.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(data));
  } catch (error) {
    console.error('OpenRouter Proxy Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'Proxy Error: ' + error.message }));
  }
};
