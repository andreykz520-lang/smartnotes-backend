// In-memory + environment persistent store for Vercel Serverless Functions
// Supports global state persistence and dynamic code generation

const PERMANENT_KEYS = {
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  YOOKASSA_SHOP_ID: process.env.YOOKASSA_SHOP_ID || '',
  YOOKASSA_SECRET_KEY: process.env.YOOKASSA_SECRET_KEY || ''
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
    yookassaSecretKey: PERMANENT_KEYS.YOOKASSA_SECRET_KEY
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
