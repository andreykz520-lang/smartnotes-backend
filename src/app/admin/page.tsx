"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [stats, setStats] = useState({ pro: 0, free: 0 });
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStats = async (pwd: string) => {
    try {
      const res = await fetch(`/api/admin?password=${encodeURIComponent(pwd)}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setLoggedIn(true);
      } else {
        setMessage("Неверный пароль.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Ошибка соединения с сервером.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    fetchStats(password);
  };

  const handleGrantPro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        setEmail("");
        // Refresh stats
        fetchStats(password);
      } else {
        setMessage(`❌ Ошибка: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Произошла ошибка при отправке запроса.");
    } finally {
      setLoading(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">SmartNotes Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Мастер-пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Введите пароль..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Войти
            </button>
            {message && <p className="text-red-400 text-sm text-center mt-4">{message}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            SmartNotes Admin Dashboard
          </h1>
          <button 
            onClick={() => setLoggedIn(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Выйти
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Статистика пользователей</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl">
                <span className="text-gray-400">PRO версии</span>
                <span className="text-2xl font-bold text-indigo-400">{stats.pro}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl">
                <span className="text-gray-400">Бесплатные (FREE)</span>
                <span className="text-2xl font-bold text-gray-300">{stats.free}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-indigo-900/30 border border-indigo-500/20 rounded-xl">
                <span className="text-indigo-200">Всего пользователей</span>
                <span className="text-2xl font-bold text-white">{stats.pro + stats.free}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Выдать PRO статус</h2>
            <form onSubmit={handleGrantPro} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Email пользователя</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Обработка..." : "Активировать PRO"}
              </button>
              
              {message && (
                <div className={`p-4 rounded-xl mt-4 border ${message.includes('✅') ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
