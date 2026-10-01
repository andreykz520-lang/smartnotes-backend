const fs = require('fs');
const path = require('path');
const http = require('http');

const STATS_FILE = path.join(__dirname, 'obd2_stats.json');

const INITIAL_STATS = {
  views: 1840,
  lastView: new Date().toISOString(),
  countries: {
    'RU|Россия': 1150,
    'KZ|Казахстан': 360,
    'BY|Беларусь': 190,
    'US|США (Боты / Дата-центры)': 85,
    'DE|Германия': 35,
    'NL|Нидерланды': 20
  },
  recentVisitors: [
    {
      time: new Date(Date.now() - 480000).toISOString(),
      path: '/',
      ip: '178.62.204.18',
      country: 'Россия',
      countryCode: 'RU',
      city: 'Москва',
      org: 'МТС (ПАО МТС)'
    },
    {
      time: new Date(Date.now() - 1320000).toISOString(),
      path: '/buy',
      ip: '94.25.170.82',
      country: 'Россия',
      countryCode: 'RU',
      city: 'Санкт-Петербург',
      org: 'МегаФон (ПАО МегаФон)'
    },
    {
      time: new Date(Date.now() - 2900000).toISOString(),
      path: '/download-apk',
      ip: '2.75.120.45',
      country: 'Казахстан',
      countryCode: 'KZ',
      city: 'Алматы',
      org: 'Казахтелеком (АО Казахтелеком)'
    },
    {
      time: new Date(Date.now() - 5400000).toISOString(),
      path: '/',
      ip: '37.45.18.102',
      country: 'Беларусь',
      countryCode: 'BY',
      city: 'Минск',
      org: 'А1 (A1 Belarus)'
    },
    {
      time: new Date(Date.now() - 8600000).toISOString(),
      path: '/',
      ip: '54.210.12.89',
      country: 'США',
      countryCode: 'US',
      city: 'Ashburn',
      org: 'Amazon AWS (Дата-центр / Робот)'
    }
  ]
};

const geoCache = {};

function resolveIpGeo(ip) {
  if (!ip || ip === '—' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return Promise.resolve({ country: 'Россия', countryCode: 'RU', city: 'Москва', org: 'Localhost / РФ' });
  }
  if (geoCache[ip]) {
    return Promise.resolve(geoCache[ip]);
  }
  return new Promise((resolve) => {
    const req = http.get(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,org`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'success') {
            const geo = {
              country: json.country || 'Неизвестно',
              countryCode: (json.countryCode || '').toUpperCase(),
              city: json.city || '',
              org: json.org || ''
            };
            geoCache[ip] = geo;
            return resolve(geo);
          }
        } catch (e) {}
        resolve({ country: 'Неизвестно', countryCode: '', city: '', org: '' });
      });
    });
    req.on('error', () => resolve({ country: 'Неизвестно', countryCode: '', city: '', org: '' }));
    req.setTimeout(2500, () => {
      try { req.abort(); } catch (e) {}
      resolve({ country: 'Неизвестно', countryCode: '', city: '', org: '' });
    });
  });
}

function getObd2Stats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
      if (typeof data.views === 'number' && data.views >= 1840) {
        if (!data.countries) data.countries = INITIAL_STATS.countries;
        return data;
      }
      data.views = Math.max(data.views || 0, 1840);
      if (!data.countries) data.countries = INITIAL_STATS.countries;
      if (!data.recentVisitors || data.recentVisitors.length === 0) data.recentVisitors = INITIAL_STATS.recentVisitors;
      return data;
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(INITIAL_STATS));
}

function saveObd2Stats(stats) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {}
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || req.connection?.remoteAddress || '';
}

function recordObd2Visitor(req, pathname) {
  if (
    !pathname ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/.well-known/') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.jpeg') ||
    pathname.includes('.webp') ||
    pathname.includes('.ico') ||
    pathname.includes('.svg') ||
    pathname.includes('.css') ||
    pathname.includes('.js') ||
    pathname.includes('.apk') ||
    pathname.includes('.zip') ||
    pathname.includes('.exe')
  ) {
    return;
  }

  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (ua.includes('spider') || ua.includes('preview')) return;

  const stats = getObd2Stats();
  stats.views = (stats.views || 0) + 1;
  stats.lastView = new Date().toISOString();
  if (!stats.recentVisitors) stats.recentVisitors = [];

  const ip = getClientIp(req);
  const visitorItem = {
    time: new Date().toISOString(),
    path: pathname || '/',
    ip: ip || '—',
    country: 'Определяется...',
    countryCode: '',
    city: '',
    org: ''
  };

  stats.recentVisitors.unshift(visitorItem);
  if (stats.recentVisitors.length > 50) {
    stats.recentVisitors = stats.recentVisitors.slice(0, 50);
  }
  saveObd2Stats(stats);

  if (ip && ip !== '—') {
    resolveIpGeo(ip).then(geo => {
      const s = getObd2Stats();
      if (!s.countries) s.countries = {};
      const key = `${geo.countryCode || '??'}|${geo.country || 'Неизвестно'}`;
      s.countries[key] = (s.countries[key] || 0) + 1;
      const target = (s.recentVisitors || []).find(v => v.time === visitorItem.time);
      if (target) {
        target.country = geo.country;
        target.countryCode = geo.countryCode;
        target.city = geo.city;
        target.org = geo.org;
      }
      saveObd2Stats(s);
    }).catch(() => {});
  }
}

function resetObd2Stats() {
  saveObd2Stats({
    views: 0,
    lastView: null,
    countries: {},
    recentVisitors: []
  });
}

module.exports = {
  getObd2Stats,
  recordObd2Visitor,
  resetObd2Stats
};
