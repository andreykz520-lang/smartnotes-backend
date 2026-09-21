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
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    // Защита: полностью блокируем Kimi/Moonshot
    if (body && body.model && (body.model.toLowerCase().includes('kimi') || body.model.toLowerCase().includes('moonshot'))) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ error: 'Model Kimi is blocked and not allowed' }));
    }

    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    let apiKey = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!apiKey || apiKey === 'null' || apiKey === 'undefined' || apiKey === 'VIP-KEY-OBD2' || apiKey.length < 10) {
      apiKey = process.env.OPENROUTER_API_KEY || '';
    }

    if (!apiKey) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ error: 'OpenRouter API key is required and must be configured' }));
    }

    // Default to google/gemini-3.7-flash
    let model = 'google/gemini-3.7-flash';
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
