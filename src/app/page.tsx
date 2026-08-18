"use client";

import Link from 'next/link';
import { useLanguage } from './context/LanguageContext';

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
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
            <a href="#features" className="hover:text-white transition-colors">{t('features')}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t('pricing')}</a>
            <Link 
              href="/buy" 
              className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-gray-100 transition-all font-semibold"
            >
              {t('buy_pro')}
            </Link>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent border border-white/20 rounded-md px-2 py-1 text-sm outline-none cursor-pointer"
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
            {t('title')} <br />
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              {t('subtitle')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-normal leading-relaxed mb-10">
            {t('description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="/SmartNotes.apk"
              download="SmartNotes.apk"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-gray-100 text-black font-semibold text-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              📥 {t('download_android')}
            </a>
            <Link
              href="/buy"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)]"
            >
              👑 {t('buy_pro')}
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 relative bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('features_title')}</h2>
            <p className="text-gray-400 text-lg">{t('features_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-6">
                ✨
              </div>
              <h3 className="text-xl font-bold mb-3">{t('feature_1_title')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('feature_1_desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mb-6">
                🎙️
              </div>
              <h3 className="text-xl font-bold mb-3">{t('feature_2_title')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('feature_2_desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-2xl mb-6">
                💬
              </div>
              <h3 className="text-xl font-bold mb-3">{t('feature_3_title')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('feature_3_desc')}
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors md:col-span-3 lg:col-span-2 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-6">
                  ☁️
                </div>
                <h3 className="text-2xl font-bold mb-3">{t('feature_4_title')}</h3>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  {t('feature_4_desc')}
                </p>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none" />
            </div>

            {/* Feature 5 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors lg:col-span-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-6">
                🔒
              </div>
              <h3 className="text-xl font-bold mb-3">{t('feature_5_title')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('feature_5_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 relative overflow-hidden border-t border-white/10 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('pricing')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* 1. Free */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold mb-2">{t('free_plan')}</h3>
              <p className="text-gray-400 text-sm mb-6">{t('free_plan_desc')}</p>
              <div className="text-3xl font-bold mb-6">{t('free_price')}</div>
              
              <ul className="space-y-3 mb-8 flex-1 text-left w-full text-sm">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> {t('free_feat_1')}
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> {t('free_feat_2')}
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> {t('free_feat_3')}
                </li>
              </ul>
              
              <a href="/SmartNotes.apk" download="SmartNotes.apk" className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-center text-sm font-semibold hover:bg-white/10 transition-colors">
                {t('download_btn')}
              </a>
            </div>

            {/* 2. PRO Lifetime */}
            <div className="bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold mb-2">{t('pro_lifetime_plan')}</h3>
              <p className="text-gray-400 text-sm mb-6">{t('pro_lifetime_desc')}</p>
              <div className="flex items-end gap-1.5 mb-6">
                <span className="text-3xl font-bold">{t('pro_lifetime_price')}</span>
                <span className="text-gray-400 text-xs mb-1">{t('pro_lifetime_period')}</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1 text-left w-full text-sm">
                <li className="flex items-center gap-3 text-gray-200">
                  <span className="text-purple-400">✦</span> {t('pro_lifetime_feat_1')}
                </li>
                <li className="flex items-center gap-3 text-gray-200">
                  <span className="text-purple-400">✦</span> {t('pro_lifetime_feat_2')}
                </li>
                <li className="flex items-center gap-3 text-gray-200">
                  <span className="text-purple-400">✦</span> {t('pro_lifetime_feat_3')}
                </li>
              </ul>
              
              <Link href="/buy?plan=pro" className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-center text-sm font-bold border border-white/20 transition-all">
                {t('buy_pro_lifetime')}
              </Link>
            </div>

            {/* 3. PRO+ AI */}
            <div className="bg-gradient-to-b from-purple-600/30 to-indigo-600/10 border-2 border-purple-500/60 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="absolute -top-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {t('popular')}
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pro_plan')}</h3>
              <p className="text-gray-300 text-sm mb-6">{t('pro_plan_desc')}</p>
              <div className="flex items-end gap-1.5 mb-6">
                <span className="text-3xl font-bold text-white">{t('pro_price')}</span>
                <span className="text-purple-300 text-xs mb-1">{t('pro_period')}</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1 text-left w-full text-sm">
                <li className="flex items-center gap-3 text-white">
                  <span className="text-purple-300 font-bold">★</span> {t('pro_feat_1')}
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-purple-300 font-bold">★</span> {t('pro_feat_2')}
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-purple-300 font-bold">★</span> {t('pro_feat_3')}
                </li>
              </ul>
              
              <Link href="/buy?plan=pro_plus" className="w-full py-3 rounded-xl bg-white text-black text-center text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                {t('buy_pro')}
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12">
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <p>{t('footer')}</p>
          <Link href="/admin" className="text-xs text-gray-700 hover:text-gray-400 transition-colors">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
