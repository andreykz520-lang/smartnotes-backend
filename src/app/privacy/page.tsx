import Link from 'next/link';

export const metadata = {
  title: 'Политика конфиденциальности — SmartNotes AI',
};

export default function PrivacyPage() {
  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen font-sans p-6 sm:p-12 selection:bg-purple-500 selection:text-white">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mb-8 transition-colors">
          ← На главную
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Политика конфиденциальности</h1>
        <p className="text-gray-400 text-sm mb-8">Дата обновления: 18 августа 2026 г.</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сервиса и мобильного приложения <strong>SmartNotes AI</strong> (далее — Сервис), предоставляемого самозанятым Чемаревым Андреем Владимировичем (ИНН: 540314274724).
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">2. Собираемая информация</h2>
            <p className="mb-2">Сервис собирает минимально необходимый объем данных для обеспечения работы функций:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Адрес электронной почты (Email) — для отправки чеков, кодов активации подписки и авторизации в облачной синхронизации.</li>
              <li>Идентификатор устройства (Device ID) — для контроля лимита подключенных устройств (до 3 устройств на аккаунт).</li>
              <li>Данные заметок — хранятся локально на устройстве пользователя и шифруются при облачной синхронизации.</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">3. Защита и безопасность данных</h2>
            <p>
              Все соединения Сервиса защищены современными криптографическими протоколами SSL/HTTPS (256-bit). Доступ к секретным заметкам ограничен локальным PIN-кодом на устройстве пользователя. Сервис не передает персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">4. Платежи и безопасность</h2>
            <p>
              Обработка платежей осуществляется через аккредитованного платежного провайдера ЮKassa (ООО НКО «ЮМани») и Telegram Payments. Сервис не хранит и не обрабатывает реквизиты банковских карт пользователей.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">5. Контакты и реквизиты</h2>
            <p className="text-gray-300">
              Самозанятый: <strong>Чемарев Андрей Владимирович</strong><br />
              ИНН: <strong>540314274724</strong><br />
              Email для связи и поддержки: <a href="mailto:autoneuro24@gmail.com" className="text-purple-400 underline">autoneuro24@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
