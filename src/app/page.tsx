"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from './context/LanguageContext';

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const isRu = language === 'ru';

  const [selectedPlan, setSelectedPlan] = useState<'pro_plus' | 'pro'>('pro_plus');
  const [paymentMethod, setPaymentMethod] = useState<'yookassa' | 'telegram'>(isRu ? 'yookassa' : 'telegram');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get('plan');
      if (planParam === 'pro' || planParam === 'pro_plus') {
        setSelectedPlan(planParam);
      }
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const validateEmail = (val: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  };

  const handleYooKassaBuy = async () => {
    if (!email.trim() || !validateEmail(email)) {
      setEmailError(isRu ? 'Пожалуйста, введите корректный email' : 'Please enter a valid email');
      return;
    }

    setLoading(true);
    setError(null);
    setEmailError('');
    
    try {
      const response = await fetch('/api/buy', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(),
          plan: selectedPlan
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || (isRu ? 'Ошибка при создании платежа' : 'Payment error'));
        setLoading(false);
      }
    } catch (err) {
      setError(isRu ? 'Ошибка сети. Попробуйте позже.' : 'Network error');
      setLoading(false);
    }
  };

  const telegramBotLink = `https://t.me/SmartNotesAIBot?start=${selectedPlan}${email ? `_${encodeURIComponent(email)}` : ''}`;

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen selection:bg-purple-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/icon.png" alt="SmartNotes AI Icon" className="w-10 h-10 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] object-cover" />
            <span className="font-bold text-lg sm:text-xl tracking-tight">SmartNotes AI</span>
          </Link>

          <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">{t('features')}</a>
            <a href="#screenshots" className="hover:text-white transition-colors">{t('screenshots_nav')}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t('pricing')}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t('faq_nav')}</a>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a 
              href="#checkout" 
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(147,51,234,0.4)]"
            >
              👑 {t('buy_pro')}
            </a>

            <select 
              value={language} 
              onChange={(e) => {
                const newLang = e.target.value as any;
                setLanguage(newLang);
                setPaymentMethod(newLang === 'ru' ? 'yookassa' : 'telegram');
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer text-white font-medium backdrop-blur-md"
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
      <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/30 blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-[100%] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            {isRu ? 'Встроенный ИИ Gemini 3.7 Flash и голосовой ввод на лету' : 'Built-in Gemini 3.7 Flash AI & Live Voice Dictation'}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.15] mb-6">
            {t('title')} <br />
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              {t('subtitle')}
            </span>
          </h1>

          <p className="text-base md:text-xl text-gray-400 max-w-2xl font-normal leading-relaxed mb-10">
            {t('description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="/SmartNotes.apk"
              download="SmartNotes.apk"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-gray-100 text-black font-bold text-base sm:text-lg transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)]"
            >
              📥 {t('download_android')}
            </a>
            <a
              href="#pricing"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-base sm:text-lg transition-all shadow-[0_0_25px_rgba(147,51,234,0.4)]"
            >
              👑 {t('choose_plan')}
            </a>
          </div>

        </div>
      </section>

      {/* SCREENSHOTS / APP PREVIEW */}
      <section id="screenshots" className="py-20 relative bg-[#070707] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('screenshots_title')}</h2>
            <p className="text-gray-400 text-base md:text-lg">{t('screenshots_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1: Notes List */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center hover:border-purple-500/40 transition-all">
              <div className="w-full h-80 bg-gradient-to-b from-[#111] to-[#181820] rounded-2xl p-4 border border-white/10 mb-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-gray-400">
                  <span className="font-bold text-white text-sm">📝 {isRu ? 'Все заметки' : 'All Notes'}</span>
                  <span>🔍 ⚙️</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs font-bold text-purple-300 mb-1">💡 {isRu ? 'Планы на проект' : 'Project Roadmap'}</div>
                    <div className="text-[11px] text-gray-400">{isRu ? 'Добавить голосовой ввод и саммари...' : 'Add voice dictation and AI summaries...'}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs font-bold text-emerald-300 mb-1">🔒 {isRu ? 'Секретная заметка (PIN)' : 'Secret Note (PIN)'}</div>
                    <div className="text-[11px] text-gray-400">••••••••••••••••••</div>
                  </div>
                </div>
                <div className="text-center text-xs text-purple-400 font-semibold pt-2">
                  + {isRu ? 'Новая заметка' : 'New Note'}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{t('screen_1_title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm text-center">{t('screen_1_desc')}</p>
            </div>

            {/* Card 2: Voice Dictation */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center hover:border-purple-500/40 transition-all">
              <div className="w-full h-80 bg-gradient-to-b from-[#111] to-[#181820] rounded-2xl p-4 border border-white/10 mb-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-gray-400">
                  <span className="font-bold text-white text-sm">🎙️ {isRu ? 'Голосовой ввод' : 'Live Dictation'}</span>
                  <span className="text-red-400 animate-pulse">● REC</span>
                </div>
                <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl my-auto text-xs text-gray-200 leading-relaxed">
                  "{isRu ? 'Записать ключевые мысли встречи: запустить релиз ИИ-помощника и обновить тарифы...' : 'Record key meeting insights: deploy AI assistant release and update plans...'}"
                </div>
                <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                  🎙️ {isRu ? 'Распознавание на лету' : 'Live Speech-to-Text'}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{t('screen_2_title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm text-center">{t('screen_2_desc')}</p>
            </div>

            {/* Card 3: AI Chat with Vision */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center hover:border-purple-500/40 transition-all">
              <div className="w-full h-80 bg-gradient-to-b from-[#111] to-[#181820] rounded-2xl p-4 border border-white/10 mb-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-gray-400">
                  <span className="font-bold text-purple-400 text-sm">✨ Gemini 3.7 Flash</span>
                  <span>💬</span>
                </div>
                <div className="space-y-2">
                  <div className="self-end bg-purple-600/30 border border-purple-500/30 rounded-xl p-2.5 text-[11px] text-white">
                    📷 <em>{isRu ? 'Фото часов прикреплено' : 'Watch photo attached'}</em>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-[11px] text-gray-300">
                    🤖 {isRu ? 'На фотографии черные классические часы, стрелки показывают 15:13.' : 'The photo shows a classic black wristwatch showing 15:13.'}
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/10 rounded-xl text-[11px] text-gray-400">
                  <span>📷 🎙️</span>
                  <span className="text-gray-500">{isRu ? 'Задайте вопрос...' : 'Ask a question...'}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{t('screen_3_title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm text-center">{t('screen_3_desc')}</p>
            </div>

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
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-6">✨</div>
              <h3 className="text-xl font-bold mb-3">{t('feature_1_title')}</h3>
              <p className="text-gray-400 leading-relaxed">{t('feature_1_desc')}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mb-6">🎙️</div>
              <h3 className="text-xl font-bold mb-3">{t('feature_2_title')}</h3>
              <p className="text-gray-400 leading-relaxed">{t('feature_2_desc')}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-2xl mb-6">💬</div>
              <h3 className="text-xl font-bold mb-3">{t('feature_3_title')}</h3>
              <p className="text-gray-400 leading-relaxed">{t('feature_3_desc')}</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors md:col-span-3 lg:col-span-2 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-6">☁️</div>
                <h3 className="text-2xl font-bold mb-3">{t('feature_4_title')}</h3>
                <p className="text-gray-400 leading-relaxed max-w-md">{t('feature_4_desc')}</p>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none" />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors lg:col-span-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-6">🔒</div>
              <h3 className="text-xl font-bold mb-3">{t('feature_5_title')}</h3>
              <p className="text-gray-400 leading-relaxed">{t('feature_5_desc')}</p>
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

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            
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
              
              <a 
                href="#checkout" 
                onClick={() => setSelectedPlan('pro')}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-center text-sm font-bold border border-white/20 transition-all cursor-pointer"
              >
                {t('buy_pro_lifetime')}
              </a>
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
              
              <a 
                href="#checkout" 
                onClick={() => setSelectedPlan('pro_plus')}
                className="w-full py-3 rounded-xl bg-white text-black text-center text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.4)] cursor-pointer"
              >
                {t('buy_pro')}
              </a>
            </div>
            
          </div>

          {/* EMBEDDED CHECKOUT SECTION */}
          <div id="checkout" className="max-w-xl mx-auto bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] relative backdrop-blur-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-1">{t('tariffs_title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">{t('tariffs_subtitle')}</p>
            </div>

            {/* ПЕРЕКЛЮЧАТЕЛЬ ТАРИФОВ */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/40 border border-white/10 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setSelectedPlan('pro_plus')}
                className={`py-3 px-2 rounded-xl font-semibold text-xs sm:text-sm transition-all text-center flex flex-col items-center justify-center gap-1 ${
                  selectedPlan === 'pro_plus'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1 font-bold">👑 {t('pro_plan')}</span>
                <span className="text-[11px] opacity-90">{t('pro_price')} {t('pro_period')}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('pro')}
                className={`py-3 px-2 rounded-xl font-semibold text-xs sm:text-sm transition-all text-center flex flex-col items-center justify-center gap-1 ${
                  selectedPlan === 'pro'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1 font-bold">⭐ {t('pro_lifetime_plan')}</span>
                <span className="text-[11px] opacity-90">{t('pro_lifetime_price')} {t('pro_lifetime_period')}</span>
              </button>
            </div>

            {/* СПОСОБ ОПЛАТЫ */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {t('payment_method_title')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('yookassa')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'yookassa'
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5">{t('region_cis')}</div>
                  <div className="text-[11px] text-gray-400">{t('region_cis_sub')}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('telegram')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'telegram'
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5">{t('region_global')}</div>
                  <div className="text-[11px] text-gray-400">{t('region_global_sub')}</div>
                </button>
              </div>
            </div>

            {/* ВВОД EMAIL И ОПЛАТА */}
            {paymentMethod === 'yookassa' ? (
              <div>
                <div className="mb-5">
                  <label htmlFor="checkout_email" className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {t('your_email')} <span className="text-purple-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="checkout_email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder="user@example.com"
                    className={`w-full px-4 py-3 bg-[#0A0A0A] border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm transition-all ${
                      emailError ? 'border-red-500' : 'border-white/10'
                    }`}
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1.5">{emailError}</p>}
                  <p className="text-[11px] text-gray-500 mt-1.5">{t('email_hint')}</p>
                </div>

                <button 
                  onClick={handleYooKassaBuy} 
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-[0_0_25px_rgba(147,51,234,0.35)] text-sm"
                >
                  {loading ? '...' : `${t('pay_via_yookassa')} (${selectedPlan === 'pro_plus' ? (isRu ? '150 ₽' : '$3') : (isRu ? '500 ₽' : '$10')})`}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <label htmlFor="checkout_tg_email" className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {t('your_email')}
                  </label>
                  <input
                    type="email"
                    id="checkout_tg_email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm transition-all"
                  />
                </div>

                <a
                  href={telegramBotLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold rounded-xl transition-all mb-4 shadow-[0_0_25px_rgba(42,171,238,0.35)] text-sm text-center"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.536-.196 1.006.128.832.943z"/>
                  </svg>
                  {t('pay_via_telegram')} ({selectedPlan === 'pro_plus' ? '$3' : '$10'})
                </a>
              </div>
            )}
            
            <div className="flex justify-center items-center gap-4 text-gray-400 text-xs pt-2 border-t border-white/10">
              <span className="flex items-center gap-1">🔒 256-bit SSL</span>
              <span className="flex items-center gap-1">⚡ Instant</span>
              <span className="flex items-center gap-1">📱 3 devices</span>
            </div>

            {error && <p className="text-red-400 mt-4 text-center text-xs bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">{error}</p>}
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 relative bg-[#0A0A0A] border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('faq_title')}</h2>
            <p className="text-gray-400 text-lg">{t('faq_subtitle')}</p>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => {
              const isOpen = openFaq === i;
              return (
                <div 
                  key={i} 
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(i)}
                    className="w-full p-5 sm:p-6 text-left font-semibold text-base sm:text-lg flex justify-between items-center gap-4 hover:text-purple-400 transition-colors"
                  >
                    <span>{t(`faq_${i}_q` as any)}</span>
                    <span className="text-xl text-purple-400 transition-transform duration-200">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-gray-300 leading-relaxed border-t border-white/5 pt-4">
                      {t(`faq_${i}_a` as any)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <p>{t('footer')}</p>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-gray-400 transition-colors">{t('features')}</a>
            <a href="#screenshots" className="hover:text-gray-400 transition-colors">{t('screenshots_nav')}</a>
            <a href="#pricing" className="hover:text-gray-400 transition-colors">{t('pricing')}</a>
            <a href="#faq" className="hover:text-gray-400 transition-colors">{t('faq_nav')}</a>
            <Link href="/admin" className="text-xs text-gray-700 hover:text-gray-400 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
