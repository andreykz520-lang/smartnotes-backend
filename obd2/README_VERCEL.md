# 🚀 Инструкция по развертыванию Vercel Сервера (obd2-activation-server)

## 📌 Что реализовано на сервере:

1. **Защита от сброса кэша и бесконечного триала**: Сервер привязывает триал к `ANDROID_ID` телефона. Повторный триал с этого смартфона заблокирован намертво.
2. **OTP-подтверждение по Email (6 цифр)**: Запрос триала генерирует 6-значный код и отправляет на почту. Нельзя активировать триал на выдуманный e-mail.
3. **Авто-восстановление PRO кодов**: Если переустановить приложение на том же телефоне (`ANDROID_ID`), при повторном вводе старого кода сервер мгновенно восстанавливает лицензию без ошибок `409`.
4. **Админ-панель (`/admin.html`)**: Защищена паролем `ADMIN_PASSWORD`. Позволяет генерировать коды PRO, видеть активные блокировки устройства и удалять ключи.

---

## 🛠️ Как развернуть на Vercel (За 2 минуты):

### Вариант А: Через GitHub (Рекомендуется)
1. Создайте репозиторий на GitHub (например, `obd2-activation-server`).
2. Скопируйте содержимое папки `d:\OBD2SCANAI\vercel-server\` в этот репозиторий и сделайте `git push`.
3. Перейдите на [Vercel.com](https://vercel.com) ➔ нажмите **Add New... Project** ➔ выберите ваш репозиторий `obd2-activation-server`.

### Вариант Б: Через Vercel CLI
В консоли (PowerShell) в папке `d:\OBD2SCANAI\vercel-server`:
```bash
npx vercel
```

---

## 🔑 Переменные Окружения (Environment Variables) на Vercel:

Зайдите в ваш проект в панели Vercel: **Settings ➔ Environment Variables** и добавьте 2 переменные:

1. **`ADMIN_PASSWORD`**:
   - **Value**: `ваш_пароль_для_админки` (например `SuperAdmin2026`)
   - *Для чего*: Защищает вход в админ-панель `https://obd2-activation-server.vercel.app/admin.html`.

2. **`RESEND_API_KEY`** (Опционально, для отправки писем):
   - Зарегистрируйтесь на [Resend.com](https://resend.com) (бесплатно 3000 писем/мес).
   - Скопируйте API-ключ `re_123456...`.
   - **Value**: `re_123456...`
   - *Для чего*: Отправляет 6-значные коды OTP на почту пользователей при запросе триала и высылает ключи при покупке.

---

## 🌐 Рабочие URL после развертывания:

- 🟢 **Админ-панель**: `https://obd2-activation-server.vercel.app/admin.html`
- 🛒 **Страница покупки**: `https://obd2-activation-server.vercel.app/buy.html`
- ⚡ **API Активации**: `https://obd2-activation-server.vercel.app/api/activate`
- 📩 **API OTP Триала**: `https://obd2-activation-server.vercel.app/api/trial-otp`
- 🛡️ **API Проверки OTP**: `https://obd2-activation-server.vercel.app/api/verify-trial-otp`
