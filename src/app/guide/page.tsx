"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function GuidePage() {
  const { t, language, setLanguage } = useLanguage();
  const isRu = language === "ru";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen selection:bg-purple-500 selection:text-white font-sans">
      {/* Navigation (скрывается при печати) */}
      <nav className="fixed w-full z-50 bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="SmartNotes AI Icon"
              className="w-10 h-10 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] object-cover"
            />
            <span className="font-bold text-lg sm:text-xl tracking-tight">SmartNotes AI</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
            >
              {isRu ? "← На главную" : "← Back to Home"}
            </Link>

            <button
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 rounded-full bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
            >
              📄 {isRu ? "Скачать PDF / Печать" : "Print / PDF"}
            </button>

            <a
              href="/app"
              className="px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-[0_0_15px_rgba(147,51,234,0.4)]"
            >
              🌐 {isRu ? "Открыть веб-блокнот" : "Open Web App"}
            </a>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-xs outline-none cursor-pointer text-white font-medium"
            >
              <option value="ru" className="text-black">RU</option>
              <option value="en" className="text-black">EN</option>
              <option value="es" className="text-black">ES</option>
              <option value="fr" className="text-black">FR</option>
              <option value="de" className="text-black">DE</option>
              <option value="ar" className="text-black">AR</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-4 sm:px-6 max-w-4xl mx-auto print:pt-4 print:pb-4 print:text-black print:max-w-none">
        
        {/* Header */}
        <div className="text-center mb-16 print:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4 print:hidden">
            📖 {isRu ? "Официальное руководство пользователя" : "Official User Guide"}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 print:text-3xl print:text-black">
            {isRu ? "Руководство пользователя SmartNotes AI" : "SmartNotes AI User Guide"}
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed print:text-gray-700">
            {isRu
              ? "Умный блокнот и электронная записная книжка с искусственным интеллектом на 6 языках. Всё о веб-версии, диктовке голосом, ИИ-помощнике и защите заметок."
              : "Smart multilingual AI notebook and notepad in 6 languages. Complete guide to the universal web version, voice dictation, Gemini AI, and privacy features."}
          </p>

          <div className="mt-8 flex justify-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold text-sm transition-all flex items-center gap-2"
            >
              📥 {isRu ? "Сохранить инструкцию в PDF" : "Save as PDF"}
            </button>
            <a
              href="/app"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-sm shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all"
            >
              🚀 {isRu ? "Перейти в блокнот онлайн" : "Launch Online App"}
            </a>
          </div>
        </div>

        {/* SECTION 1: WEB VERSION (PWA) */}
        <section className="mb-14 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 print:border-gray-300 print:bg-white print:p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌐</span>
            <h2 className="text-2xl font-bold print:text-black">
              {isRu ? "1. Как пользоваться универсальной веб-версией" : "1. How to Use the Universal Web App"}
            </h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6 print:text-gray-800">
            {isRu
              ? "Веб-версия SmartNotes AI — это полноценное PWA-приложение (Progressive Web App). Ей не нужны магазины приложений: она работает мгновенно в браузере любого устройства — Android, iPhone, Windows, Mac, Linux и ОС «Аврора». Она не забивает память телефона и всегда обновлена до последней версии."
              : "SmartNotes AI web version is a full PWA. No app store installation required: it runs seamlessly on Android, iOS, Windows, Mac, Linux, and Aurora OS, saving device storage."}
          </p>

          <h3 className="text-lg font-bold text-purple-300 mb-4 print:text-purple-800">
            {isRu ? "📱 Как вынести иконку блокнота на рабочий стол (в 1 клик):" : "📱 Add to Home Screen (1 Click):"}
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 print:border-gray-200 print:bg-gray-50">
              <div className="font-bold mb-1 text-sm text-purple-400 print:text-purple-900">🤖 Android (Chrome/Яндекс)</div>
              <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside print:text-gray-700">
                <li>Откройте <strong>smartnotes-ai.ru/app</strong></li>
                <li>Нажмите три точки <strong>⋮</strong> в правом верхнем углу</li>
                <li>Выберите <strong>«Установить приложение»</strong> или «Добавить на главный экран»</li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 print:border-gray-200 print:bg-gray-50">
              <div className="font-bold mb-1 text-sm text-purple-400 print:text-purple-900">🍏 iPhone / iPad (Safari)</div>
              <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside print:text-gray-700">
                <li>Откройте <strong>smartnotes-ai.ru/app</strong> в Safari</li>
                <li>Нажмите кнопку <strong>«Поделиться» (квадрат со стрелкой ⎋)</strong></li>
                <li>Прокрутите вниз и выберите <strong>«На экран «Домой»</strong></li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 print:border-gray-200 print:bg-gray-50">
              <div className="font-bold mb-1 text-sm text-purple-400 print:text-purple-900">💻 ПК / Ноутбук / Аврора</div>
              <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside print:text-gray-700">
                <li>Откройте сайт в Chrome / Edge / Яндекс</li>
                <li>В адресной строке справа нажмите значок <strong>⊕ («Установить»)</strong></li>
                <li>Иконка появится на рабочем столе как отдельная программа!</li>
              </ol>
            </div>
          </div>
        </section>

        {/* SECTION 2: 6 LANGUAGES */}
        <section className="mb-14 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 print:border-gray-300 print:bg-white print:p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌍</span>
            <h2 className="text-2xl font-bold print:text-black">
              {isRu ? "2. Поддержка 6 языков интерфейса и распознавания" : "2. 6 Supported Languages"}
            </h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4 print:text-gray-800">
            {isRu
              ? "SmartNotes AI полностью адаптирован для пользователей со всего мира. Доступны: Русский (RU), Английский (EN), Испанский (ES), Французский (FR), Немецкий (DE) и Арабский (AR). Переключение языка доступно в один клик в правом верхнем углу меню."
              : "SmartNotes AI is localized into 6 languages: Russian, English, Spanish, French, German, and Arabic. Switch anytime using the language selector."}
          </p>
          <div className="flex flex-wrap gap-2">
            {["🇷🇺 Русский", "🇬🇧 English", "🇪🇸 Español", "🇫🇷 Français", "🇩🇪 Deutsch", "🇸🇦 العربية"].map((l) => (
              <span key={l} className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-200 print:text-gray-800 print:border-gray-300">
                {l}
              </span>
            ))}
          </div>
        </section>

        {/* SECTION 3: CORE FEATURES GUIDE */}
        <section className="mb-14 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 print:border-gray-300 print:bg-white print:p-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">⚡</span>
            <h2 className="text-2xl font-bold print:text-black">
              {isRu ? "3. Как пользоваться ключевыми функциями" : "3. Key Features Walkthrough"}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="border-b border-white/10 pb-5 last:border-0 print:border-gray-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                🎙️ {isRu ? "Голосовой ввод на лету (Speech-to-Text)" : "Real-time Voice Dictation"}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed print:text-gray-700">
                {isRu
                  ? "Нажмите на значок микрофона внутри любой заметки и говорите. Приложение мгновенно переводит речь в текст, расставляет знаки препинания и делит мысли по абзацам. Идеально для записи идей за рулём или на ходу."
                  : "Tap the microphone icon inside any note and start speaking. Instant speech-to-text converts your voice into structured writing."}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border-b border-white/10 pb-5 last:border-0 print:border-gray-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                ✨ {isRu ? "Умный анализ и ИИ-помощник (Gemini 3.8)" : "Smart AI Summaries (Gemini 3.8)"}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed print:text-gray-700">
                {isRu
                  ? "Вставьте длинную статью, конспект лекции или протокол совещания и нажмите «Суммаризовать с ИИ». Нейросеть за 2 секунды выделит самое главное, составит список задач и план действий."
                  : "Paste lengthy texts, lectures, or meeting minutes. Gemini AI creates a crisp summary and an action plan in seconds."}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border-b border-white/10 pb-5 last:border-0 print:border-gray-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                🔒 {isRu ? "Секретные заметки под PIN-кодом" : "Secret Notes with PIN"}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed print:text-gray-700">
                {isRu
                  ? "Личные мысли, пароли или конфиденциальные планы можно скрыть под 4-значным PIN-кодом. Содержимое таких записей надёжно зашифровано и не отображается в общем списке без ввода кода."
                  : "Protect sensitive thoughts and passwords with a 4-digit PIN lock. Data is encrypted and hidden from preview."}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="border-b border-white/10 pb-5 last:border-0 print:border-gray-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                💬 {isRu ? "ИИ-Чат и распознавание объектов по фото" : "AI Vision & Photo Chat"}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed print:text-gray-700">
                {isRu
                  ? "Прикрепите фотографию часов, прибора, рецепта или документа в чат с ассистентом. ИИ определит модель, переведёт текст с картинки или найдёт похожие товары."
                  : "Attach photos of items, documents, or objects. The AI assistant identifies them, extracts text, and answers questions."}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="border-b border-white/10 pb-5 last:border-0 print:border-gray-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                ☁️ {isRu ? "Облачная синхронизация между устройствами" : "Cloud Sync across Devices"}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed print:text-gray-700">
                {isRu
                  ? "Начните писать заметку на телефоне в метро — и продолжите её редактировать на компьютере дома. Синхронизация до 3-х устройств гарантирует, что вы никогда не потеряете важные записи."
                  : "Start writing on your phone, continue editing on your laptop. Real-time synchronization keeps your notes up to date."}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: FEEDBACK & SUPPORT */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-black border border-purple-500/30 print:border-gray-300 print:bg-white print:p-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            💡 {t('feedback_title')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 print:text-black">
            {t('feedback_title')}
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-6 print:text-gray-700">
            {t('feedback_desc')}
          </p>
          <div className="flex flex-wrap gap-4 print:hidden">
            <a
              href="mailto:autoneuro24@gmail.com?subject=SmartNotes%20AI%20Feedback%20and%20Bug%20Report"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)] flex items-center gap-2"
            >
              ✉️ {t('feedback_btn')} (autoneuro24@gmail.com)
            </a>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold"
            >
              📄 {isRu ? "Распечатать памятку" : "Print Guide"}
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
