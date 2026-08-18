"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function BuyPage() {
  const { t, language, setLanguage } = useLanguage();
  const isRu = language === 'ru';

  const [selectedPlan, setSelectedPlan] = useState<'pro_plus' | 'pro'>('pro_plus');
  const [paymentMethod, setPaymentMethod] = useState<'yookassa' | 'telegram'>(isRu ? 'yookassa' : 'telegram');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    setPaymentMethod(isRu ? 'yookassa' : 'telegram');
  }, [language, isRu]);

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

  const validateEmail = (val: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  };

  const handleYooKassaBuy = async () => {
    if (!email.trim() || !validateEmail(email)) {
      setEmailError('Пожалуйста, введите корректный email');
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
        setError(data.error || 'Ошибка при создании платежа');
        setLoading(false);
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте позже.');
      setLoading(false);
    }
  };

  const telegramBotLink = `https://t.me/SmartNotesAIBot?start=${selectedPlan}${email ? `_${encodeURIComponent(email)}` : ''}`;

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen font-sans selection:bg-purple-500 selection:text-white relative flex flex-col justify-center items-center p-4 sm:p-6">
      
      {/* HEADER BAR */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
          <span>{t('back_to_home')}</span>
        </Link>

        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-black/60 border border-white/20 rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer text-white backdrop-blur-md"
        >
          <option value="ru" className="text-black">RU</option>
          <option value="en" className="text-black">EN</option>
          <option value="es" className="text-black">ES</option>
          <option value="fr" className="text-black">FR</option>
          <option value="de" className="text-black">DE</option>
          <option value="ar" className="text-black">AR</option>
        </select>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/20 blur-[130px] rounded-[100%] pointer-events-none" />

      <div className="w-full max-w-xl bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] relative z-10 backdrop-blur-2xl mt-12 sm:mt-0">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{t('tariffs_title')}</h1>
          <p className="text-gray-400 text-sm">{t('tariffs_subtitle')}</p>
        </div>

        {/* ПЕРЕКЛЮЧАТЕЛЬ ТАРИФОВ */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/40 border border-white/10 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setSelectedPlan('pro_plus')}
            className={`py-3 px-3 rounded-xl font-semibold text-xs sm:text-sm transition-all text-center flex flex-col items-center justify-center gap-1 ${
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
            className={`py-3 px-3 rounded-xl font-semibold text-xs sm:text-sm transition-all text-center flex flex-col items-center justify-center gap-1 ${
              selectedPlan === 'pro'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1 font-bold">⭐ {t('pro_lifetime_plan')}</span>
            <span className="text-[11px] opacity-90">{t('pro_lifetime_price')} {t('pro_lifetime_period')}</span>
          </button>
        </div>

        {/* ОПИСАНИЕ ВЫБРАННОГО ТАРИФА */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          {selectedPlan === 'pro_plus' ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-purple-400">{t('pro_plan')}</span>
                <span className="text-lg font-bold text-white">{t('pro_price')} <span className="text-xs text-gray-400 font-normal">{t('pro_period')}</span></span>
              </div>
              <ul className="text-xs text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">✨ {t('pro_feat_1')}</li>
                <li className="flex items-center gap-2">🎙️ {t('pro_feat_2')}</li>
                <li className="flex items-center gap-2">☁️ {t('pro_feat_3')}</li>
              </ul>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-purple-400">{t('pro_lifetime_plan')}</span>
                <span className="text-lg font-bold text-white">{t('pro_lifetime_price')} <span className="text-xs text-gray-400 font-normal">{t('pro_lifetime_period')}</span></span>
              </div>
              <ul className="text-xs text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">☁️ {t('pro_lifetime_feat_1')}</li>
                <li className="flex items-center gap-2">📄 {t('pro_lifetime_feat_2')}</li>
                <li className="flex items-center gap-2">🔒 {t('pro_lifetime_feat_3')}</li>
              </ul>
            </div>
          )}
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
              <label htmlFor="email" className="block text-xs font-semibold text-gray-300 mb-1.5">
                {t('your_email')} <span className="text-purple-500">*</span>
              </label>
              <input
                type="email"
                id="email"
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
              {emailError && (
                <p className="text-red-500 text-xs mt-1.5">{emailError}</p>
              )}
              <p className="text-[11px] text-gray-500 mt-1.5">
                {t('email_hint')}
              </p>
            </div>

            <button 
              onClick={handleYooKassaBuy} 
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-[0_0_25px_rgba(147,51,234,0.35)] text-sm"
            >
              {loading ? '...' : `${t('pay_via_yookassa')} (${selectedPlan === 'pro_plus' ? '150 ₽' : '500 ₽'})`}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <label htmlFor="tg_email" className="block text-xs font-semibold text-gray-300 mb-1.5">
                {t('your_email')}
              </label>
              <input
                type="email"
                id="tg_email"
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
  );
}