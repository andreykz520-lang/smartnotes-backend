# 🚀 Инструкция по настройке системы активации OBDIISCANAI PRO

## 📋 Что было добавлено:

### ✅ Новые функции:
1. **Сбор email** при покупке кода
2. **Автоматическая отправка кода на email** (красивое письмо с инструкциями)
3. **Сохранение email в базе данных**
4. **Отображение email в админ-панели**
5. **Кнопка "Создать код вручную"** в админке

---

## 🗄️ База данных - Где хранится?

База данных хранится там, где вы укажете в переменной `DATABASE_URL`.

### Рекомендуемые варианты (БЕСПЛАТНО):

#### 1. **Neon.tech** (РЕКОМЕНДУЮ) ⭐
```
✅ Serverless PostgreSQL
✅ Бесплатно навсегда (500MB хранилища)
✅ Быстрая настройка (2 минуты)
✅ Автоматические бэкапы
```

**Шаги:**
1. Зайдите на https://neon.tech
2. Зарегистрируйтесь (можно через GitHub)
3. Создайте новый проект "obdiiscanai"
4. Скопируйте `DATABASE_URL` (Connection String)
5. Вставьте в файл `.env.local`

#### 2. **Supabase** (альтернатива)
```
https://supabase.com
✅ PostgreSQL + дополнительные функции
✅ Бесплатный план
```

---

## 📧 Настройка Email (Resend)

### Почему Resend?
- ✅ **100 писем в день БЕСПЛАТНО**
- ✅ Простая настройка (5 минут)
- ✅ Красивые HTML письма
- ✅ Высокая доставляемость

### Шаги настройки:

1. **Зарегистрируйтесь на Resend:**
   ```
   https://resend.com/signup
   ```

2. **Получите API ключ:**
   - Dashboard → API Keys → Create API Key
   - Скопируйте ключ (начинается с `re_...`)

3. **Добавьте домен (опционально):**
   - Для тестирования можно использовать `onboarding@resend.dev`
   - Для продакшена добавьте свой домен
   - Dashboard → Domains → Add Domain

4. **Настройте переменные окружения:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   ```

5. **Измените email отправителя:**
   В файле `src/lib/email.ts` измените:
   ```typescript
   from: 'OBDIISCANAI <noreply@ВАШ-ДОМЕН.com>',
   ```

---

## 🔧 Установка и запуск

### 1. Установите зависимости:
```bash
cd implementing-android-in-app-purchases
npm install
```

### 2. Создайте файл `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Заполните переменные окружения:
```env
DATABASE_URL=postgresql://...  # Из Neon.tech
RESEND_API_KEY=re_...          # Из Resend.com
```

### 4. Создайте таблицы в базе данных:
```bash
npm run db:push
# или
npx drizzle-kit push
```

### 5. Запустите сервер локально:
```bash
npm run dev
```

Откройте: http://localhost:3000

---

## 🌐 Развертывание на Vercel (БЕСПЛАТНО)

### Шаги:

1. **Создайте репозиторий на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/ВАШ-ПОЛЬЗОВАТЕЛЬ/obdiiscanai-activation.git
   git push -u origin main
   ```

2. **Зайдите на Vercel:**
   ```
   https://vercel.com
   ```

3. **Импортируйте проект:**
   - New Project → Import Git Repository
   - Выберите ваш репозиторий

4. **Добавьте переменные окружения:**
   - Settings → Environment Variables
   - Добавьте `DATABASE_URL` и `RESEND_API_KEY`

5. **Деплой:**
   - Deploy → Готово! 🎉

Ваш сайт будет доступен по адресу: `https://ваш-проект.vercel.app`

---

## 📱 Что делать дальше?

### В Android приложении нужно добавить:

1. **Экран активации PRO** (`ActivationActivity.kt`)
   - Поле ввода кода
   - Кнопка "Активировать"
   - HTTP запросы к вашему серверу

2. **Проверка статуса PRO** при запуске приложения
   - Запрос к `/api/verify`
   - Сохранение статуса в SharedPreferences

3. **Блокировка PRO функций** если не активировано

Хотите, чтобы я помог добавить это в Android приложение?

---

## 🧪 Тестирование системы

### 1. Покупка кода (с email):
   ```
   http://localhost:3000/buy
   ```
   - Введите email
   - Нажмите "Pay $9.99"
   - Проверьте почту (должно прийти письмо)

### 2. Админ-панель:
   ```
   http://localhost:3000/admin
   ```
   - Проверьте список кодов
   - Создайте код вручную

### 3. API проверки:
   ```bash
   # Активация кода
   curl -X POST http://localhost:3000/api/activate \
     -H "Content-Type: application/json" \
     -d '{"code":"XXXX-XXXX-XXXX-XXXX","deviceId":"test-device-123"}'

   # Проверка кода
   curl -X POST http://localhost:3000/api/verify \
     -H "Content-Type: application/json" \
     -d '{"deviceId":"test-device-123"}'
   ```

---

## 📊 Структура базы данных

### Таблица `activation_codes`:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | serial | Автоинкремент ID |
| `code` | text | Код активации (уникальный) |
| `email` | text | Email клиента (опционально) |
| `isUsed` | boolean | Использован или нет |
| `deviceId` | text | Android ID устройства |
| `createdAt` | timestamp | Дата создания |
| `activatedAt` | timestamp | Дата активации |

---

## 🔐 Безопасность

- ✅ Коды генерируются криптографически безопасно (`crypto.randomBytes`)
- ✅ Email валидируется на клиенте и сервере
- ✅ Один код = одно устройство (проверка по `deviceId`)
- ✅ HTTPS обязателен для продакшена

---

## 💰 Стоимость

### Бесплатные сервисы:
- **Vercel**: Хостинг Next.js (бесплатно)
- **Neon.tech**: PostgreSQL база (бесплатно до 500MB)
- **Resend**: Email (100 писем/день бесплатно)

### Если нужно больше:
- **Resend Pro**: $20/мес (50,000 писем)
- **Neon Pro**: $19/мес (больше БД)
- **Vercel Pro**: $20/мес (больше трафика)

**Итого для старта: $0/месяц** 🎉

---

## 📞 Поддержка

Если возникли вопросы, проверьте:
1. Логи в консоли браузера (F12)
2. Логи Vercel (Dashboard → Logs)
3. Логи Resend (Dashboard → Logs)

---

## ✅ Чеклист запуска:

- [ ] База данных настроена (Neon.tech)
- [ ] Resend API ключ получен
- [ ] `.env.local` создан и заполнен
- [ ] `npm install` выполнен
- [ ] `npm run db:push` выполнен
- [ ] `npm run dev` работает
- [ ] Тестовая покупка работает
- [ ] Email приходит
- [ ] Админ-панель работает
- [ ] Код в GitHub загружен
- [ ] Vercel деплой выполнен
- [ ] Android экран активации добавлен

---

🎉 **Готово! Теперь у вас полноценная система лицензирования!**
