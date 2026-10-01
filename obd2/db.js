// In-memory + environment persistent store for Vercel Serverless Functions
// Supports global state persistence and dynamic code generation

const PERMANENT_KEYS = {
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  YOOKASSA_SHOP_ID: process.env.YOOKASSA_SHOP_ID || '',
  YOOKASSA_SECRET_KEY: process.env.YOOKASSA_SECRET_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
  OPENROUTER_PROXY_URL: process.env.OPENROUTER_PROXY_URL || 'https://smartnotes-backend-two.vercel.app/api/proxy/openrouter/v1/chat/completions'
};

const initialCodes = {
  "PRO-VIP-2026-TEST": { isUsed: false, deviceId: null, email: null, tier: "PRO", price: "500 RUB", isSubscription: false, createdAt: 1786980000000 },
  "PRO-307-PEUGEOT-01": { isUsed: false, deviceId: null, email: null, tier: "PRO", price: "500 RUB", isSubscription: false, createdAt: 1786980000000 },
  "PRO-QASHQAI-CVT-02": { isUsed: false, deviceId: null, email: null, tier: "PRO", price: "500 RUB", isSubscription: false, createdAt: 1786980000000 },
  "PLUS-AI-TEST-2026": { isUsed: false, deviceId: null, email: null, tier: "PRO_PLUS", price: "150 RUB", isSubscription: true, createdAt: 1786980000000 }
};

const memoryStore = global._obd2Store || {
  settings: {
    botEnabled: true,
    botToken: PERMANENT_KEYS.TELEGRAM_BOT_TOKEN,
    resendApiKey: PERMANENT_KEYS.RESEND_API_KEY,
    yookassaShopId: PERMANENT_KEYS.YOOKASSA_SHOP_ID,
    yookassaSecretKey: PERMANENT_KEYS.YOOKASSA_SECRET_KEY,
    openRouterKey: PERMANENT_KEYS.OPENROUTER_API_KEY,
    aiModel: PERMANENT_KEYS.OPENROUTER_MODEL,
    openRouterProxyUrl: PERMANENT_KEYS.OPENROUTER_PROXY_URL
  },
  codes: { ...initialCodes },
  deletedCodes: {},
  deviceTrials: {},
  emailTrials: {},
  emails: [],
  otps: {},
  botUsers: {}
};

if (!global._obd2Store) {
  global._obd2Store = memoryStore;
}

module.exports = {
  store: memoryStore,
  PERMANENT_KEYS: PERMANENT_KEYS
};
