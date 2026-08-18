import Link from 'next/link';

export const metadata = {
  title: 'Оплата и возврат — SmartNotes AI',
};

export default function RefundPage() {
  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen font-sans p-6 sm:p-12 selection:bg-purple-500 selection:text-white">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mb-8 transition-colors">
          ← На главную
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Оплата и условия возврата</h1>
        <p className="text-gray-400 text-sm mb-8">Дата обновления: 18 августа 2026 г.</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">1. Способы оплаты</h2>
            <p className="mb-2">Оплата услуг на сайте осуществляется следующими способами:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Банковские карты (МИР, Visa, Mastercard) через защищенный шлюз ЮKassa.</li>
              <li>Система быстрых платежей (СБП), T-Pay, СберPay.</li>
              <li>Telegram Stars (международная оплата через официального бота @SmartNotesAIBot).</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">2. Моментальная доставка</h2>
            <p>
              Доступ к сервису предоставляется моментально в автоматическом режиме сразу после подтверждения транзакции. Код активации и чек отправляются на указанный пользователем Email и отображаются на экране.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">3. Порядок возврата денежных средств</h2>
            <p>
              В соответствии с законодательством РФ возврат денежных средств за непредоставленную или некорректно оказанную цифровую услугу осуществляется по заявлению пользователя. Для оформления возврата направьте запрос на <a href="mailto:autoneuro24@gmail.com" className="text-purple-400 underline">autoneuro24@gmail.com</a> с указанием Email и номера транзакции. Возврат производится на ту же банковскую карту, с которой была совершена оплата, в срок от 1 до 10 рабочих дней.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3">4. Реквизиты продавца</h2>
            <p className="text-gray-300">
              Самозанятый: <strong>Чемарев Андрей Владимирович</strong><br />
              ИНН: <strong>540314274724</strong><br />
              Email: <a href="mailto:autoneuro24@gmail.com" className="text-purple-400 underline">autoneuro24@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
