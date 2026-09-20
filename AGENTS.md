# Правила проекта SmartNotes Backend (Project Invariants & Architecture)

## 1. Запрет на нарушение функционала (No Regressions)
- Все существующие маршруты API (`/api/auth/*`, `/api/proxy/*`, `/api/buy`, `/api/webhook`, `/api/health`, `/app`, `/download/*`) должны сохранять обратную совместимость.
- Запрещено удалять или ломать синхронизацию базы данных Neon PostgreSQL.

## 2. Архитектура работы ИИ (Россия / Зарубеж)
- Сервер расположен в РФ. Прямые запросы к Google Gemini и OpenRouter блокируются.
- Все вызовы к OpenRouter и Google Gemini ОБЯЗАТЕЛЬНО перенаправляются через Vercel edge-шлюз: `https://smartnotes-backend-two.vercel.app/api/proxy/...`.
- Для Сбер GigaChat используется `/api/proxy/gigachat` с отключением проверки неподдерживаемых клиентских SSL-сертификатов (`rejectUnauthorized: false`), чтобы у пользователей в РФ не возникало ошибок отсутствия сертификатов Минцифры.

## 3. Тарифы
- Админы (`andreykz520@gmail.com`, `andreykz@yahoo.com`, `autoneuro24@gmail.com`) всегда имеют статус PRO+.
- При авторизации триал выдается только новым устройствам на 30 дней.
