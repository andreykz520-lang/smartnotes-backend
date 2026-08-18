import Link from 'next/link';

export const metadata = {
  title: 'Пользовательское соглашение и Оферта — SmartNotes AI',
};

export default function TermsPage() {
  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen font-sans p-6 sm:p-12 selection:bg-purple-500 selection:text-white">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mb-8 transition-colors">
          ← На главную
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Пользовательское соглашение (Публичная оферта)</h1>
        <p className="text-gray-400 text-sm mb-8">Дата публикации: 18 августа 2026 г.</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">1. Предмет соглашения</h2>
            <p>
              Настоящее Соглашение является официальным публичным предложением (публичной офертой) самозанятого Чемарева Андрея Владимировича (ИНН 540314274724) о предоставлении неисключительной лицензии на использование программного обеспечения и онлайн-сервиса <strong>SmartNotes AI</strong>.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">2. Тарифные планы и порядок оплаты</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li><strong>Базовый тариф:</strong> Бесплатно. Локальное создание заметок, распознавание речи и возможность ввода собственных API-ключей.</li>
              <li><strong>Тариф PRO (Бессрочный):</strong> 500 рублей (разовый платеж). Включает облачную синхронизацию до 3 устройств, экспорт в PDF и секретные заметки.</li>
              <li><strong>Тариф PRO+ (С подпиской на ИИ):</strong> 150 рублей в месяц. Включает все функции PRO и встроенный искусственный интеллект Gemini 3.7 Flash без необходимости настройки личных ключей.</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">3. Момент активации услуг</h2>
            <p>
              Обязательства по предоставлению доступа считаются исполненными с момента успешного проведения оплаты и генерации уникального кода активации / привязки лицензии к указанному пользователем адресу электронной почты.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">4. Реквизиты исполнителя</h2>
            <p className="text-gray-300">
              Исполнитель: <strong>Самозанятый Чемарев Андрей Владимирович</strong><br />
              ИНН: <strong>540314274724</strong><br />
              Email службы поддержки: <a href="mailto:autoneuro24@gmail.com" className="text-purple-400 underline">autoneuro24@gmail.com</a><br />
              Сайт: <a href="https://smartnotes-ai.ru" className="text-purple-400 underline">https://smartnotes-ai.ru</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
