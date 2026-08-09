"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function BuyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleBuy = async () => {
    if (!email.trim() || !validateEmail(email)) {
      setEmailError('Пожалуйста, введите корректный email');
      return;
    }

    setLoading(true);
    setError(null);
    setEmailError('');
    
    try {
      // Отправляем запрос на наш сервер для создания платежа в ЮKassa
      const response = await fetch('/api/buy', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim()
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

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen font-sans selection:bg-purple-500 selection:text-white relative flex flex-col justify-center items-center p-6">
      
      <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
        <span>← Назад</span>
      </Link>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/20 blur-[100px] rounded-[100%] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.1)] relative z-10 backdrop-blur-xl">
        <h1 className="text-3xl font-bold mb-2">PRO Версия</h1>
        <p className="text-gray-400 mb-8">
          Оплатите <strong className="text-white">1490 ₽</strong> один раз и пользуйтесь приложением вечно.
        </p>

        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
            Ваш Email <span className="text-purple-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            placeholder="your@email.com"
            className={`w-full px-4 py-3 bg-[#0A0A0A] border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all ${
              emailError ? 'border-red-500' : 'border-white/10'
            }`}
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-2">{emailError}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            На этот email мы отправим вам чек и код активации.
          </p>
        </div>

        <button 
          onClick={handleBuy} 
          disabled={loading}
          className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          {loading ? 'Создаем безопасный платеж...' : 'Перейти к оплате'}
        </button>
        
        <div className="flex justify-center gap-6 text-gray-400 text-sm">
          <span className="flex items-center gap-1">🔒 Безопасная оплата</span>
          <span className="flex items-center gap-1">💳 ЮKassa / СБП</span>
        </div>

        {error && <p className="text-red-500 mt-6 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
      </div>
    </div>
  );
}