"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen selection:bg-purple-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="SmartNotes AI Icon" className="w-10 h-10 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] object-cover" />
            <span className="font-bold text-xl tracking-tight">SmartNotes AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Возможности</a>
            <a href="#pricing" className="hover:text-white transition-colors">Тарифы</a>
            <Link 
              href="/buy" 
              className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-gray-100 transition-all font-semibold"
            >
              Купить PRO
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center">
        {/* Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/30 blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-[100%] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm font-medium mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Синхронизация между устройствами уже доступна!
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
            Ваш второй мозг, <br />
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              усиленный ИИ.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-normal leading-relaxed mb-10">
            Организуйте мысли, расшифровывайте голос, получайте краткие выжимки текстов и общайтесь с вашими заметками через умный чат-бот.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="#"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-gray-100 text-black font-semibold text-lg transition-all"
            >
              Скачать бесплатно
            </a>
            <Link
              href="/buy"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all"
            >
              Купить PRO версию
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 relative bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Суперспособности для ваших идей</h2>
            <p className="text-gray-400 text-lg">Всё, что нужно для продуктивности в одном приложении.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-6">
                ✨
              </div>
              <h3 className="text-xl font-bold mb-3">AI Саммари</h3>
              <p className="text-gray-400 leading-relaxed">
                Длинные тексты превращаются в короткие выжимки. ИИ автоматически выделит главное и создаст теги.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mb-6">
                🎙️
              </div>
              <h3 className="text-xl font-bold mb-3">Голос в текст</h3>
              <p className="text-gray-400 leading-relaxed">
                Записывайте голосовые мысли на ходу, а нейросеть расшифрует их с идеальной пунктуацией.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-2xl mb-6">
                💬
              </div>
              <h3 className="text-xl font-bold mb-3">Умный Чат</h3>
              <p className="text-gray-400 leading-relaxed">
                Общайтесь с ИИ прямо в приложении. Задавайте вопросы, генерируйте идеи и сохраняйте ответы.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors md:col-span-3 lg:col-span-2 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-6">
                  ☁️
                </div>
                <h3 className="text-2xl font-bold mb-3">Облачная синхронизация</h3>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  Ваши заметки всегда под рукой. Начните писать на телефоне, продолжите на планшете. Доступно до 3-х устройств на PRO аккаунте.
                </p>
              </div>
              {/* Decorative element */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none" />
            </div>

            {/* Feature 5 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors lg:col-span-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-6">
                🔒
              </div>
              <h3 className="text-xl font-bold mb-3">Полная секретность</h3>
              <p className="text-gray-400 leading-relaxed">
                Скрывайте личные заметки за PIN-кодом. Они будут невидимы в общем списке.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 relative border-t border-white/10 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Простые тарифы</h2>
            <p className="text-gray-400 text-lg">Без скрытых платежей.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Free */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-10 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Базовый</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-bold">Бесплатно</span>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Неограниченное число локальных заметок
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Категории и теги
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Секретные заметки (PIN-код)
                </li>
                <li className="flex items-center gap-3 text-gray-500 line-through">
                  <span>✗</span> Использование AI Чат-бота
                </li>
                <li className="flex items-center gap-3 text-gray-500 line-through">
                  <span>✗</span> Расшифровка голоса и Саммари
                </li>
                <li className="flex items-center gap-3 text-gray-500 line-through">
                  <span>✗</span> Облачная синхронизация
                </li>
              </ul>
              
              <a href="#" className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-center font-semibold hover:bg-white/10 transition-colors">
                Скачать
              </a>
            </div>

            {/* PRO */}
            <div className="bg-gradient-to-b from-purple-900/40 to-[#0A0A0A] border border-purple-500/50 rounded-3xl p-10 flex flex-col relative shadow-[0_0_40px_rgba(168,85,247,0.15)]">
              <div className="absolute -top-4 right-8 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Рекомендуем
              </div>
              
              <h3 className="text-2xl font-bold mb-2 text-purple-400">PRO Версия</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-bold">1490 ₽</span>
                <span className="text-gray-400">навсегда</span>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-white">
                  <span className="text-purple-400">✦</span> Всё из Базового тарифа
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-purple-400">✦</span> До 3-х устройств на одном аккаунте
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-purple-400">✦</span> Облачная синхронизация
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-purple-400">✦</span> Доступ к AI-боту (Gemini / GigaChat)
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-purple-400">✦</span> Расшифровка голоса и Саммари текста
                </li>
              </ul>
              
              <Link href="/buy" className="w-full py-4 rounded-xl bg-white text-black text-center font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Оформить PRO
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 text-center text-gray-500">
        <p>© 2026 SmartNotes AI. Все права защищены.</p>
      </footer>
    </div>
  );
}
