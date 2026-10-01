const fs = require('fs');
const path = require('path');
const { store, PERMANENT_KEYS } = require('../db');

const CHAT_FILE = path.join(__dirname, '..', 'tester_chat.json');

const INITIAL_MESSAGES = [
  {
    id: 'msg_init_1',
    name: 'Дмитрий (Peugeot 307)',
    car: 'Peugeot 307 1.6 NFU (ME7.4.4)',
    text: 'На Пежо 307 по протоколу KWP2000 теперь видит 19 параметров двигателя! Провёл серию тестов: на холодную, на горячую и в поездке. Куда отправить логи для вечного PRO?',
    time: new Date(Date.now() - 43200000).toISOString(),
    isAi: false,
    isAdmin: false
  },
  {
    id: 'msg_init_2',
    name: 'Разработчик OBD2 SCAN AI',
    car: 'Команда поддержки',
    text: 'Дмитрий, отличная работа! Серия тестов в разных режимах — это как раз то, что нужно для стабильности. Отправляйте файлы логов на autoneuro24@gmail.com с темой «Peugeot 307», сразу активируем вечный тариф PRO Навсегда 🎁',
    time: new Date(Date.now() - 42800000).toISOString(),
    isAi: false,
    isAdmin: true
  },
  {
    id: 'msg_init_3',
    name: 'Сергей (ВАЗ 2110)',
    car: 'ВАЗ 2110 1.5 8V (Январь 5.1)',
    text: 'Привет! Хочу помочь в тестировании своего ВАЗ с Январем 5.1. Как правильно снять логи, чтобы помочь отладке приложения?',
    time: new Date(Date.now() - 21600000).toISOString(),
    isAi: false,
    isAdmin: false
  },
  {
    id: 'msg_init_4',
    name: '🤖 AI Диагност',
    car: 'Автоэксперт OBD2',
    text: 'Привет, Сергей! Подключите адаптер ELM327 v1.5 к диагностическому разъёму и проведите серию тестов: 1) при холодном пуске, 2) на полностью прогретом моторе, 3) в движении на ходу. Затем в меню приложения нажмите «Экспорт отладочного лога» и отправьте файлы на autoneuro24@gmail.com — мы сразу подарим вам пожизненный тариф PRO!',
    time: new Date(Date.now() - 21500000).toISOString(),
    isAi: true,
    isAdmin: false
  },
  {
    id: 'msg_init_5',
    name: 'Иван (Renault Logan)',
    car: 'Renault Logan 1.6',
    text: 'А безопасно ли проводить эти тесты? Приложение не может сбить заводскую прошивку или повредить блок управления?',
    time: new Date(Date.now() - 7200000).toISOString(),
    isAi: false,
    isAdmin: false
  },
  {
    id: 'msg_init_6',
    name: '🤖 AI Диагност',
    car: 'Автоэксперт OBD2',
    text: 'Иван, приложение на 100% безопасно! OBD2 SCAN AI работает строго в пассивном режиме чтения (Passive Read-Only). Оно отправляет исключительно стандартные диагностические запросы датчиков и физически не может повлиять на прошивку, адаптации или датчики авто.',
    time: new Date(Date.now() - 7100000).toISOString(),
    isAi: true,
    isAdmin: false
  }
];

function getChatMessages() {
  try {
    if (fs.existsSync(CHAT_FILE)) {
      const data = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {}
  return INITIAL_MESSAGES;
}

function saveChatMessages(messages) {
  try {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (e) {}
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || req.connection?.remoteAddress || '';
}

function getOpenRouterKey() {
  const envKey = (process.env.OPENROUTER_API_KEY || '').trim();
  if (envKey && envKey !== '[SENSITIVE]') return envKey;
  return store?.settings?.openRouterKey || PERMANENT_KEYS?.OPENROUTER_API_KEY || '';
}

const AI_SYSTEM_PROMPT = `Ты — узкоспециализированный ИИ-диагност и эксперт мобильного приложения "OBD2 SCAN AI".
Твоя ЕДИНСТВЕННАЯ цель — отвечать на вопросы, связанные ИСКЛЮЧИТЕЛЬНО с:
1. Автомобильной диагностикой по протоколам OBD-II / EOBD / K-Line / CAN / KWP2000.
2. Подключением и настройкой адаптеров ELM327 (версия 1.5 на чипе PIC18F25K80, Bluetooth, Wi-Fi, USB).
3. Чтением, расшифровкой и сбросом кодов ошибок (DTC) двигателя, коробки и систем авто.
4. Функциями приложения OBD2 SCAN AI (чтение датчиков в реальном времени, виртуальная приборная панель, DPF/сажевый фильтр, проверка скрутки пробега Anti-Fraud, экспорт отладочного лога).
5. Программой бета-тестирования: напоминай автовладельцам, что процедуру тестирования нужно провести НЕ ОДИН РАЗ, а серию тестов в разных режимах (холодный пуск, прогретый мотор, тест в движении), снять логи и отправить на autoneuro24@gmail.com — за это разработчик дарит пожизненный тариф PRO Навсегда!
6. Безопасностью: приложение работает на 100% в пассивном режиме чтения (Passive Read-Only) и физически не может повредить прошивку или узлы автомобиля.

СТРОЖАЙШИЕ ПРАВИЛА И ОГРАНИЧЕНИЯ:
1. ЕСЛИ ВОПРОС НЕ КАСАЕТСЯ АВТОМОБИЛЕЙ, ДИАГНОСТИКИ, СКАНИРОВАНИЯ ИЛИ ПРИЛОЖЕНИЯ OBD2 SCAN AI (например: кулинария, рецепты, политика, программирование, погода, стихи, общие разговоры, любые посторонние темы):
ТЫ ОБЯЗАН СТРОГО И ВЕЖЛИВО ОТКАЗАТЬ:
"Я специализированный ИИ-диагност приложения OBD2 SCAN AI и консультирую исключительно по автодиагностике, сканерам ELM327, ошибкам автомобиля и тестированию нашего приложения. Пожалуйста, задайте вопрос по диагностике вашего автомобиля!"
2. Отвечай кратко, профессионально, дружелюбно, НА ТОМ ЖЕ ЯЗЫКЕ, на котором написан вопрос пользователя (русский, английский, немецкий, французский, испанский, арабский и т.д.), в 2-4 предложения (формат живого чата). Не используй markdown-заголовки # или списки более 3 пунктов.`;

// Локальный запасной генератор ответов, если нет ключа OpenRouter или недоступна сеть
function generateRuleBasedAdvice(userText, car) {
  const lower = (userText + ' ' + (car || '')).toLowerCase();

  // Отсечка явного спама и посторонних тем
  if (lower.includes('рецепт') || lower.includes('борщ') || lower.includes('суп') || lower.includes('погод') || lower.includes('стих') || lower.includes('анекдот') || lower.includes('политик')) {
    return 'Я специализированный ИИ-диагност приложения OBD2 SCAN AI и консультирую исключительно по автодиагностике, сканерам ELM327, ошибкам автомобиля и тестированию нашего приложения. Пожалуйста, задайте вопрос по диагностике вашего автомобиля!';
  }

  if (lower.includes('не подключается') || lower.includes('не видит') || lower.includes('ошибка подключения') || lower.includes('не связывается')) {
    return `Привет! Если нет связи с автомобилем, проверьте следующие моменты:\n1. Включите зажигание (или заведите мотор), чтобы ЭБУ подал питание на шину OBD-II.\n2. Убедитесь, что ваш сканер ELM327 версии 1.5 (на чипе PIC18F25K80). Урезанные клоны v2.1 часто не поддерживают протоколы.\n3. В приложении выдайте разрешение на «Устройства поблизости» (Bluetooth).\nЕсли не помогло — сохраните лог подключения в меню и пришлите на autoneuro24@gmail.com, мы поможем настроить протокол и подарим вечный PRO!`;
  }

  if (lower.includes('безопасн') || lower.includes('сломать') || lower.includes('повредить') || lower.includes('эбу') || lower.includes('прошивк')) {
    return `🛡️ Приложение на 100% безопасно для вашего автомобиля! OBD2 SCAN AI работает строго в пассивном режиме чтения (Passive Read-Only). Оно отправляет исключительно стандартные диагностические запросы и физически не способно изменить прошивку или повредить блоки управления.`;
  }

  if (lower.includes('как отправить') || lower.includes('где лог') || lower.includes('файл лога') || lower.includes('куда слать') || lower.includes('вечный pro') || lower.includes('про навсегда')) {
    return `📋 Чтобы получить пожизненный PRO Навсегда:\n1. Проведите серию тестов в разных режимах (на холодную, прогретый мотор, в поездке).\n2. В боковом меню приложения нажмите «Экспорт отладочного лога» (файл obd2_debug.log).\n3. Отправьте файлы на autoneuro24@gmail.com с указанием марки и года авто.\nРазработчик проверит лог и сразу вышлет персональный вечный ключ PRO!`;
  }

  if (lower.includes('пежо') || lower.includes('peugeot') || lower.includes('ситроен') || lower.includes('citroen')) {
    return `Французские авто (Peugeot/Citroen) опрашиваются по протоколу ISO 14230-4 KWP2000. В текущей версии для блока Bosch ME7.4.4 читается 19 параметров двигателя. Проведите серию тестов в разных режимах и пришлите логи на autoneuro24@gmail.com для оптимизации!`;
  }

  if (lower.includes('ваз') || lower.includes('лада') || lower.includes('калина') || lower.includes('приора') || lower.includes('гранта')) {
    return `Для автомобилей ВАЗ (Lada) нам очень нужны тестеры! Подключите адаптер ELM327 v1.5, проведите серию тестов (холодный пуск, прогретый двигатель, в движении) и пришлите полученные логи на autoneuro24@gmail.com — мы добавим профиль вашего ЭБУ и активируем вечный PRO!`;
  }

  return `Спасибо за обращение! Нам нужны данные тестирования в разных режимах работы авто (на холодную, на горячую, на ходу). Пожалуйста, снимите отладочный лог в приложении через боковое меню и отправьте на autoneuro24@gmail.com — мы сразу подарим вам пожизненную версию PRO!`;
}

// Запрос к AI Ассистенту через наш Vercel прокси или напрямую в OpenRouter (Google Gemini 2.5 Flash)
async function getAiAdvice(userText, car) {
  const apiKey = getOpenRouterKey();
  const model = store?.settings?.aiModel || 'google/gemini-2.5-flash';

  if (apiKey) {
    const endpoints = [
      store?.settings?.openRouterProxyUrl || 'https://smartnotes-backend-two.vercel.app/api/proxy/openrouter/v1/chat/completions',
      'https://openrouter.ai/api/v1/chat/completions'
    ];

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
            'HTTP-Referer': 'https://obd2scanai.ru',
            'X-Title': 'OBD2 SCAN AI'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: AI_SYSTEM_PROMPT },
              { role: 'user', content: `Автомобиль пользователя: ${car || 'Не указан'}\nВопрос пользователя: ${userText}` }
            ],
            max_tokens: 380,
            temperature: 0.2
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) return content;
        } else {
          console.warn(`OpenRouter endpoint ${url} returned HTTP ${res.status}, trying next...`);
        }
      } catch (e) {
        console.warn(`OpenRouter request to ${url} failed: ${e.message}, trying next...`);
      }
    }
  }

  // Запасной fallback на локальные экспертные правила
  return generateRuleBasedAdvice(userText, car);
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // GET: Получить список сообщений
  if (req.method === 'GET') {
    const all = getChatMessages();
    const publicList = all
      .filter(m => !m.isDeleted)
      .slice(-100); // последние 100 сообщений
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ success: true, messages: publicList }));
  }

  // POST: Добавить новое сообщение от пользователя
  if (req.method === 'POST') {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const name = escapeHtml((body.name || 'Автовладелец').trim().slice(0, 50));
    const car = escapeHtml((body.car || 'Автомобиль').trim().slice(0, 60));
    const text = escapeHtml((body.text || '').trim().slice(0, 1000));

    if (!text) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ success: false, error: 'Текст сообщения не может быть пустым' }));
    }

    const clientIp = getClientIp(req);
    const messages = getChatMessages();

    const userMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name,
      car: car,
      text: text,
      time: new Date().toISOString(),
      ip: clientIp,
      isAi: false,
      isAdmin: false
    };

    messages.push(userMsg);

    // Умный ответ AI Диагноста (через Gemini 2.5 Flash или экспертный fallback)
    const aiText = await getAiAdvice(text, car);
    const aiMsg = {
      id: 'msg_ai_' + (Date.now() + 1000) + '_' + Math.random().toString(36).substr(2, 4),
      name: '🤖 AI Диагност',
      car: 'Автоэксперт OBD2',
      text: aiText,
      time: new Date(Date.now() + 1000).toISOString(),
      isAi: true,
      isAdmin: false
    };
    messages.push(aiMsg);

    // Ограничиваем историю 300 сообщениями
    if (messages.length > 300) {
      messages.splice(0, messages.length - 300);
    }

    saveChatMessages(messages);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: true,
      message: 'Сообщение добавлено',
      userMessage: userMsg,
      aiMessage: aiMsg
    }));
  }

  res.statusCode = 405;
  res.end('Method Not Allowed');
};

module.exports.getChatMessages = getChatMessages;
module.exports.saveChatMessages = saveChatMessages;
