"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru';

const translations = {
  en: {
    appName: "OBD2SCANAI",
    home: "Home",
    featuresNav: "Features",
    screenshotsNav: "Screenshots",
    pricingNav: "Pricing",
    buyProNav: "Buy Pro",
    adminNav: "Admin",
    heroBadge: "⚡ Next-Gen AI Car Diagnostics",
    title: "Smart AI Auto Scanner for ELM327",
    subtitle: "Deep dealer-level diagnostics (Mode 22 / UDS), AI error decoding, real ECU odometer anti-fraud verification, hybrid battery telemetry, and live data graphs.",
    downloadFree: "Download Free (APK)",
    buyProHeaderBtn: "Get PRO Access",
    heroHighlight1: "Dealer UDS Support",
    heroHighlight2: "Odometer Fraud Check",
    heroHighlight3: "AI Engine Insights",

    // Screenshots Section
    screenshotsTitle: "Application Interface",
    screenshotsSubtitle: "Designed for clarity, speed, and deep technical control under the hood",
    shot1Title: "AI Diagnostics & Health Check",
    shot1Desc: "AI decodes DTC fault codes into plain language with repair advice, severity scale, and fault probabilities.",
    shot2Title: "ECU Odometer & Anti-Fraud",
    shot2Desc: "Read real mileage directly from hidden ECU modules (Engine, Transmission, ABS) to detect rolled back odometers.",
    shot3Title: "Hybrid Battery & DPF Monitor",
    shot3Desc: "Real-time cell voltage balancing (V1-V14), Delta V, DPF soot load tracking, and exhaust gas temperatures.",

    // Features Section
    featuresTitle: "Powerful Features",
    featuresSubtitle: "Everything you need from basic OBD2 checks to advanced dealer level analytics",
    featAiTitle: "Smart AI Diagnostics",
    featAiDesc: "No more cryptic P0171 codes. Neural network analyzes DTCs, vehicle brand history, and live telemetry to explain causes and repair steps.",
    featAntiFraudTitle: "Odometer Anti-Fraud Monitor",
    featAntiFraudDesc: "Protection when buying used cars. Reads VIN from ECU, verifies true mileage from engine/transmission blocks, counts engine hours and error reset history.",
    featBatteryTitle: "HV Hybrid Battery Monitor",
    featBatteryDesc: "Specialized tool for Toyota, Lexus, and hybrid EVs. Displays cell voltage delta (Delta V), battery temperature, SOC, and state of health (SOH).",
    featDpfTitle: "DPF Diesel Filter Telemetry",
    featDpfDesc: "Track soot mass accumulation in grams, distance since last regeneration, and exhaust temperatures (EGT) to prevent costly DPF clogs.",
    featConnectTitle: "High Speed Bluetooth & Wi-Fi",
    featConnectDesc: "Compatible with standard ELM327 v1.5 Bluetooth adapters and high-speed Wi-Fi (192.168.0.10:35000) for smooth live graph plotting.",
    featAutoDetectTitle: "Auto Vehicle & Body Detection",
    featAutoDetectDesc: "Reads VIN automatically to identify exact model profiles (e.g. Peugeot/Citroen, VAG, Mercedes, Toyota) and loads custom PIDs.",

    // Supported Cars
    carsTitle: "Deep Support for Popular Brands",
    carsSubtitle: "Includes custom Mode 21, Mode 22, and UDS diagnostic PID databases",

    // Pricing
    pricingTitle: "Choose Your Version",
    pricingSubtitle: "Get started for free or unlock unlimited AI diagnostics with Pro",
    freeVersion: "Free Version",
    freeFeatures: [
      "✓ Basic OBD2 engine code scanning",
      "✓ Clear Check Engine indicator light",
      "✓ Basic real-time sensor dashboard",
      "✓ VIN auto-detection",
      "✗ AI Engine & Transmission Health Checks",
      "✗ Odometer Anti-fraud & ECU mileage reading",
      "✗ HV Hybrid Battery & DPF monitors",
      "✗ Advanced dealer PIDs & live data logging"
    ],
    proVersion: "PRO Version",
    proFeatures: [
      "✓ Everything included in Free",
      "✓ AI-powered engine & transmission health analysis",
      "✓ Full ECU Anti-Fraud odometer verification",
      "✓ Hybrid Battery cell monitor (V1-V14 & Delta V)",
      "✓ DPF filter soot level & regeneration monitor",
      "✓ Unlimited AI fault decoding & repair guides",
      "✓ Custom live data graphing & log exporter"
    ],
    buyProCode: "Buy PRO Activation Code",

    // Activation steps
    howToActivate: "How to Activate PRO?",
    step1Title: "1. Purchase Code",
    step1Desc: "Get your activation code instantly on this website.",
    step2Title: "2. Open App Settings",
    step2Desc: "In OBD2SCANAI, go to Settings > Upgrade to PRO.",
    step3Title: "3. Enter & Unlock",
    step3Desc: "Enter your code to unlock all AI features permanently for your Android device!",

    // Buy page
    buyTitle: "Buy PRO Activation Code",
    buyDesc1: "You are purchasing a permanent PRO License for OBD2SCANAI. Price is",
    buyDesc2: "(one-time payment, lifetime access).",
    buyMockWarning: "This is a checkout portal. Submitting generates a valid PRO activation code.",
    emailLabel: "Your Email Address",
    emailPlaceholder: "your@email.com",
    emailHint: "We will send your activation code to this email",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email address",
    emailSent: "✉️ Activation code sent to your email",
    optional: "optional",
    emailWarning: "Without email, you won't be able to recover your code if lost.",
    noEmailWarning: "⚠️ Save this code! Without email, recovery will not be possible.",
    buyButton: "Pay $9.99 & Get PRO Code",
    processing: "Processing Payment...",
    paySuccess: "Payment Successful!",
    hereIsCode: "Your PRO Activation Code:",
    saveCode: "Save this code and enter it in OBD2SCANAI -> Settings -> Upgrade to PRO.",

    // Admin
    adminDashboard: "Admin Dashboard",
    adminDesc: "Manage and inspect activation codes.",
    generateNewCode: "Generate New Code",
    generating: "Generating...",
    codeGeneratedSuccess: "Code generated successfully!",
    statusUsed: "Used",
    statusUnused: "Unused",
    resetDevice: "Reset Device",
    noCodes: "No activation codes generated yet."
  },
  ru: {
    appName: "OBD2SCANAI",
    home: "Главная",
    featuresNav: "Возможности",
    screenshotsNav: "Скриншоты",
    pricingNav: "Тарифы",
    buyProNav: "Купить PRO",
    adminNav: "Админ",
    heroBadge: "⚡ ИИ-Автосканер Нового Поколения",
    title: "Умная Автодиагностика с Искусственным Интеллектом",
    subtitle: "Глубокая дилерская диагностика (Mode 22 / UDS) для ELM327, ИИ-расшифровка ошибок, проверка реального пробега из ЭБУ, мониторинг гибридных батарей и DPF-фильтра.",
    downloadFree: "Скачать бесплатно (APK)",
    buyProHeaderBtn: "Получить PRO доступ",
    heroHighlight1: "Дилерские протоколы UDS",
    heroHighlight2: "Проверка скрученного пробега",
    heroHighlight3: "ИИ-анализ здоровья двигателя",

    // Screenshots Section
    screenshotsTitle: "Интерфейс приложения",
    screenshotsSubtitle: "Современный, наглядный и информативный дизайн для полного контроля над автомобилем",
    shot1Title: "ИИ-Диагностика и Анализ Здоровья",
    shot1Desc: "Нейросеть расшифровывает DTC ошибки понятным языком, дает оценку риска, вероятные причины и шаги ремонта.",
    shot2Title: "Анти-Фрод и Реальный Пробег",
    shot2Desc: "Чтение реального одометра напрямую из закрытых блоков ЭБУ (мотор, АКПП, ABS) для выявления скрученного пробега.",
    shot3Title: "Монитор Батареи и DPF",
    shot3Desc: "Поячеечный мониторинг гибридов (V1-V14), Delta V, уровень заполнения сажевого фильтра и температура выхлопа.",

    // Features Section
    featuresTitle: "Главные возможности",
    featuresSubtitle: "От простого сброса «Check Engine» до дилерского анализа параметров",
    featAiTitle: "🤖 Умная ИИ-Диагностика",
    featAiDesc: "Забудьте о безликих кодах вроде P0171. ИИ анализирует марку авто, симптомы и выдает вероятные причины с рекомендациями по ремонту.",
    featAntiFraudTitle: "🕵️‍♂️ Монитор «Анти-Фрод»",
    featAntiFraudDesc: "Защита при покупке авто. Чтение VIN из ЭБУ, сверка реального пробега по закрытым блокам, подбор моточасов и трекинг сброса ошибок.",
    featBatteryTitle: "🔋 Монитор Гибридной Батареи",
    featBatteryDesc: "Специализированный раздел для Toyota, Lexus и электромобилей: напряжение на каждой ячейке (V1-V14), разброс Delta V и здоровье SOH.",
    featDpfTitle: "💨 Монитор Сажевого Фильтра (DPF)",
    featDpfDesc: "Незаменимо для дизелей: уровень сажи в граммах и %, пробег с последней регенерации и температура выхлопных газов (EGT).",
    featConnectTitle: "📡 Bluetooth & Wi-Fi подключение",
    featConnectDesc: "Поддержка классических Bluetooth ELM327 v1.5 и скоростных Wi-Fi адаптеров (192.168.0.10:35000) для плавных графиков в реальном времени.",
    featAutoDetectTitle: "🧠 Автоопределение марки и кузова",
    featAutoDetectDesc: "Считывает VIN, сам определяет кузов и подтягивает базу дилерских PID (Peugeot/Citroen, VAG, Toyota, Mercedes и др.).",

    // Supported Cars
    carsTitle: "Поддержка популярного автопрома",
    carsSubtitle: "Встроенные базы расширенных дилерских команд Mode 21, Mode 22 и UDS",

    // Pricing
    pricingTitle: "Выберите вашу версию",
    pricingSubtitle: "Начните с бесплатной версии или откройте полные возможности ИИ с PRO",
    freeVersion: "Бесплатная версия",
    freeFeatures: [
      "✓ Базовое чтение ошибок двигателя (OBD2)",
      "✓ Сброс индикатора 'Check Engine'",
      "✓ Базовая панель приборов в реальном времени",
      "✓ Автоопределение VIN-кода",
      "✗ ИИ-проверка здоровья двигателя и АКПП",
      "✗ Монитор 'Анти-Фрод' и проверка реального пробега",
      "✗ Мониторы гибридной батареи и DPF сажевика",
      "✗ Расширенные дилерские параметры и запись логов"
    ],
    proVersion: "PRO Версия",
    proFeatures: [
      "✓ Все возможности бесплатной версии",
      "✓ ИИ-анализ здоровья двигателя и коробки",
      "✓ Полный Анти-Фрод контроль пробега по блокам",
      "✓ Монитор гибридных батарей (V1-V14 & Delta V)",
      "✓ Монитор сажевого фильтра (DPF) и регенерации",
      "✓ Безлимитная ИИ-расшифровка ошибок и советы",
      "✓ Построение графиков и экспорт логов"
    ],
    buyProCode: "Купить код активации PRO",

    // Activation steps
    howToActivate: "Как активировать PRO?",
    step1Title: "1. Купите код",
    step1Desc: "Оплатите код активации PRO на нашем сайте.",
    step2Title: "2. Введите в приложении",
    step2Desc: "Откройте OBD2SCANAI -> Настройки -> Обновить до PRO.",
    step3Title: "3. Наслаждайтесь PRO",
    step3Desc: "Приложение проверит код и навсегда активирует все ИИ-функции!",

    // Buy page
    buyTitle: "Купить код активации PRO",
    buyDesc1: "Вы приобретаете пожизненную PRO-лицензию для OBD2SCANAI. Стоимость:",
    buyDesc2: "(единоразовый платеж, без подписок).",
    buyMockWarning: "Это портал оплаты. Нажатие генерирует официальный код активации PRO.",
    emailLabel: "Ваш Email",
    emailPlaceholder: "ваш@email.com",
    emailHint: "Мы отправляем код активации на этот адрес",
    emailRequired: "Email обязателен",
    emailInvalid: "Введите корректный email",
    emailSent: "✉️ Код активации отправлен на ваш email",
    optional: "необязательно",
    emailWarning: "Без email восстановить код при утере будет невозможно.",
    noEmailWarning: "⚠️ Обязательно сохраните код! Без email его нельзя восстановить.",
    buyButton: "Оплатить $9.99 и получить PRO код",
    processing: "Обработка платежа...",
    paySuccess: "Оплата успешно завершена!",
    hereIsCode: "Ваш код активации PRO:",
    saveCode: "Сохраните код и введите его в OBD2SCANAI -> Настройки -> Обновить до PRO.",

    // Admin
    adminDashboard: "Панель Администратора",
    adminDesc: "Управление кодами активации.",
    generateNewCode: "Создать новый код",
    generating: "Генерация...",
    codeGeneratedSuccess: "Новый код успешно создан!",
    statusUsed: "Использован",
    statusUnused: "Свободен",
    resetDevice: "Сбросить устройство",
    noCodes: "Коды активации еще не созданы."
  }
};

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('appLang') as Language;
    if (saved === 'en' || saved === 'ru') {
      setLang(saved);
    } else if (typeof window !== 'undefined' && navigator.language.startsWith('ru')) {
      setLang('ru');
    }
  }, []);

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'ru' : 'en';
    setLang(nextLang);
    localStorage.setItem('appLang', nextLang);
  };

  const t = translations[lang];

  if (!mounted) {
    return (
       <LanguageContext.Provider value={{ lang: 'en', toggleLang: () => {}, t: translations.en }}>
         <div className="opacity-0">{children}</div>
       </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

