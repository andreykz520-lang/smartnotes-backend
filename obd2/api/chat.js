const fs = require('fs');
const path = require('path');

const CHAT_FILE = path.join(__dirname, '..', 'tester_chat.json');

const INITIAL_MESSAGES = [
  {
    id: 'msg_init_1',
    name: 'Алексей (ВАЗ 2114)',
    car: 'ВАЗ 2114 1.6 8V (Январь 7.2)',
    text: 'Подключился через синий адаптер ELM327 Bluetooth v1.5. Ошибки двигателя считало моментально, показало реальную температуру ОЖ и расход. Отправил лог на почту!',
    time: new Date(Date.now() - 86400000).toISOString(),
    isAi: false,
    isAdmin: false
  },
  {
    id: 'msg_init_2',
    name: 'Разработчик OBD2 SCAN AI',
    car: 'Команда поддержки',
    text: 'Спасибо, Алексей! Лог с Января 7.2 успешно получен и разобран. В ответном письме отправили вам вечный ключ активации тарифа PRO Навсегда 🎁',
    time: new Date(Date.now() - 85800000).toISOString(),
    isAi: false,
    isAdmin: true
  },
  {
    id: 'msg_init_3',
    name: 'Михаил (Toyota Corolla)',
    car: 'Toyota Corolla 2012 (1.6 АКПП)',
    text: 'Привет! Параметры двигателя и приборка читаются быстро. А температуру АКПП и ошибки ABS сможет прочитать?',
    time: new Date(Date.now() - 43200000).toISOString(),
    isAi: false,
    isAdmin: false
  },
  {
    id: 'msg_init_4',
    name: '🤖 AI Диагност',
    car: 'Автоэксперт OBD2',
    text: 'Привет, Михаил! По стандартному OBD2 (Mode 01) считываются параметры двигателя и общие коды DTC. Для чтения температуры АКПП и блока ABS Toyota мы как раз расширяем базу через логи тестеров. Пожалуйста, запустите «Полный скан» в приложении и отправьте файл лога на autoneuro24@gmail.com — мы добавим эти датчики, а вам сразу активируем вечный PRO!',
    time: new Date(Date.now() - 43100000).toISOString(),
    isAi: true,
    isAdmin: false
  },
  {
    id: 'msg_init_5',
    name: 'Дмитрий (Peugeot 307)',
    car: 'Peugeot 307 1.6 NFU (ME7.4.4)',
    text: 'На Пежо 307 по протоколу KWP2000 теперь видит 19 параметров двигателя в реальном времени! Тестирую проверку здоровья и приборку. Куда именно отправить лог для вечного PRO?',
    time: new Date(Date.now() - 14400000).toISOString(),
    isAi: false,
    isAdmin: false
  },
  {
    id: 'msg_init_6',
    name: 'Разработчик OBD2 SCAN AI',
    car: 'Команда поддержки',
    text: 'Дмитрий, отличная новость! В приложении в боковом меню нажмите «Экспорт отладочного лога» (или возьмите файл obd2_debug.log) и отправьте на autoneuro24@gmail.com с пометкой «Peugeot 307». Сразу вышлем вечный PRO!',
    time: new Date(Date.now() - 14100000).toISOString(),
    isAi: false,
    isAdmin: true
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

// Умный генератор ответов AI-ассистента автомеханика
function generateAiAdvice(userText, car) {
  const lower = (userText + ' ' + (car || '')).toLowerCase();

  if (lower.includes('не подключается') || lower.includes('не видит') || lower.includes('ошибка подключения') || lower.includes('не связывается')) {
    return `Привет! Если нет связи с автомобилем, проверьте следующие моменты:\n1. Включите зажигание (или заведите двигатель), чтобы ЭБУ подал питание на шину OBD-II.\n2. Убедитесь, что ваш сканер ELM327 версии 1.5 (чип PIC18F25K80). Урезанные китайские клоны v2.1 часто не поддерживают старые протоколы.\n3. В приложении выдайте разрешение на «Устройства поблизости» (Bluetooth).\nЕсли не помогло — сохраните лог подключения в меню и пришлите на autoneuro24@gmail.com, мы вручную настроим протокол под ваш ЭБУ и подарим вечный PRO!`;
  }

  if (lower.includes('безопасно') || lower.includes('сломать') || lower.includes('повредить') || lower.includes('эбу') || lower.includes('прошивк')) {
    return `🛡️ Приложение на 100% безопасно для вашего автомобиля! OBD2 SCAN AI работает строго в режиме чтения (Passive Read-Only). Оно отправляет только стандартные диагностические запросы и физически не может повредить прошивку, датчики или проводку.`;
  }

  if (lower.includes('как отправить') || lower.includes('где лог') || lower.includes('файл лога') || lower.includes('куда слать')) {
    return `📋 Чтобы отправить лог:\n1. В приложении откройте меню (три полоски слева вверху).\n2. Нажмите «Экспорт отладочного лога» (или скопируйте файл obd2_debug.log).\n3. Отправьте файл на почту autoneuro24@gmail.com, указав марку и год машины.\nВ ответ разработчик пришлёт персональный вечный ключ тарифа PRO Навсегда!`;
  }

  if (lower.includes('пежо') || lower.includes('peugeot') || lower.includes('ситроен') || lower.includes('citroen')) {
    return `Французские авто (Peugeot/Citroen) используют специальный протокол ISO 14230-4 KWP2000 с заголовком 8210F1. В последнем обновлении мы настроили чтение параметров двигателя ME7.4.4. Обязательно снимите лог подключения и пришлите на autoneuro24@gmail.com для оптимизации!`;
  }

  if (lower.includes('ваз') || lower.includes('лада') || lower.includes('калина') || lower.includes('приора') || lower.includes('гранта')) {
    return `Автомобили ВАЗ (Lada) отлично читаются по KWP2000 Fast Init (ISO 14230) или CAN (на новых Грантах/Вестах). Поддерживаются ЭБУ Январь 5.1/7.2, Bosch M7.9.7, Итэлма M73/M74. Проверьте чтение ошибок и датчиков и присылайте лог на autoneuro24@gmail.com за вечный PRO!`;
  }

  return `Спасибо за сообщение! Пожалуйста, протестируйте в приложении чтение датчиков двигателя, приборную панель и проверку здоровья. Затем нажмите в меню «Экспорт лога» и пришлите файл на autoneuro24@gmail.com с указанием марки и года авто — мы сразу активируем вам вечную PRO-версию!`;
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

    // Автоматический ответ AI Диагноста
    const aiText = generateAiAdvice(text, car);
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
