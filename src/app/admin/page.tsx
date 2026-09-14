"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  isPro: boolean;
  isProPlus: boolean;
  proStartedAt?: string | null;
  proEndedAt?: string | null;
  createdAt: string;
  devicesCount: number;
  devices?: string[];
  daysLeft?: number | null;
  isExpired?: boolean;
}

interface ActivationCode {
  id: number;
  code: string;
  email: string;
  isUsed: boolean;
  usedByDeviceId?: string | null;
  plan?: string | null;
  createdAt: string;
  activatedAt?: string | null;
}

interface PaymentItem {
  id: number;
  paymentId: string;
  email: string;
  amount: string;
  currency: string;
  status: string;
  plan: string;
  createdAt: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [show2FaModal, setShow2FaModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [users, setUsers] = useState<User[]>([]);
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  const [activeFilter, setActiveFilter] = useState<"all" | "free" | "pro" | "pro_plus">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "payments" | "codes" | "manual">("users");

  // Форма ручной выдачи
  const [manualEmail, setManualEmail] = useState("");
  const [manualPlan, setManualPlan] = useState<"pro" | "pro_plus" | "free">("pro_plus");

  const loadData = async (pwd = password, totp = totpCode) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd, totpCode: totp }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users || []);
        setCodes(data.codes || []);
        setPayments(data.payments || []);
        setTotalRevenue(data.totalRevenue || 0);
        setLoggedIn(true);
      } else {
        setMessage(data.error || "Неверный пароль администратора");
      }
    } catch (err: any) {
      console.error(err);
      setMessage("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(password, totpCode);
  };


  // Удаление пользователя
  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Вы уверены, что хотите удалить пользователя ${user.email}?\nВсе его заметки и привязка устройств (${user.devicesCount} шт.) будут полностью удалены из базы данных.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          action: "delete",
          userId: user.id,
          targetEmail: user.email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(`✅ ${data.message}`);
        loadData(password);
      } else {
        setMessage(`❌ Ошибка: ${data.error}`);
      }
    } catch (err: any) {
      setMessage("❌ Ошибка при удалении пользователя");
    } finally {
      setLoading(false);
    }
  };

  // Смена тарифа пользователя
  const handleSetPlan = async (user: User, newPlan: "free" | "pro" | "pro_plus") => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          action: "set_plan",
          userId: user.id,
          targetEmail: user.email,
          plan: newPlan,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(`✅ Тариф для ${user.email} успешно изменён на ${newPlan.toUpperCase()}`);
        loadData(password);
      } else {
        setMessage(`❌ Ошибка: ${data.error}`);
      }
    } catch (err: any) {
      setMessage("❌ Ошибка при изменении тарифа");
    } finally {
      setLoading(false);
    }
  };

  // Ручная выдача тарифа
  const handleManualGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          action: "set_plan",
          targetEmail: manualEmail.trim(),
          plan: manualPlan,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(`✅ Тариф успешно применён к ${manualEmail}`);
        setManualEmail("");
        loadData(password);
      } else {
        setMessage(`❌ Ошибка: ${data.error}`);
      }
    } catch (err: any) {
      setMessage("❌ Ошибка при выдаче тарифа");
    } finally {
      setLoading(false);
    }
  };

  // Выгрузка email в CSV
  const handleDownloadCsv = () => {
    const emailList = filteredUsers.map(u => u.email).join("\n");
    const csvContent = "data:text/csv;charset=utf-8,email\n" + emailList;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smartnotes_users_${activeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Копирование списка email
  const handleCopyEmails = () => {
    const emailList = filteredUsers.map(u => u.email).join("\n");
    navigator.clipboard.writeText(emailList);
    alert(`Скопировано ${filteredUsers.length} email-адресов!`);
  };

  // Подсчет статистики
  const totalCount = users.length;
  const proPlusCount = users.filter(u => u.isProPlus).length;
  const proCount = users.filter(u => u.isPro && !u.isProPlus).length;
  const freeCount = users.filter(u => !u.isPro && !u.isProPlus).length;

  // Фильтрация пользователей
  const filteredUsers = users.filter(u => {
    // Фильтр по тарифу
    if (activeFilter === "pro_plus" && !u.isProPlus) return false;
    if (activeFilter === "pro" && (!u.isPro || u.isProPlus)) return false;
    if (activeFilter === "free" && (u.isPro || u.isProPlus)) return false;

    // Поиск по тексту
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return u.email.toLowerCase().includes(q) || String(u.id).includes(q);
    }
    return true;
  });

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 border border-purple-500/30">
              ⚡
            </div>
            <h1 className="text-2xl font-bold text-slate-100">SmartNotes AI Admin</h1>
            <p className="text-sm text-slate-400 mt-1">Панель управления и статистика</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Пароль администратора
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Код Google Authenticator (2FA)
                </label>
                <span className="text-[11px] text-slate-500">6 цифр</span>
              </div>
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Например: 582910"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 font-mono tracking-widest text-center focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-base"
              />
            </div>

            {message && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!password && !totpCode)}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
            >
              {loading ? "Вход..." : "Войти в панель"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
              🛡️ Защита: 2FA TOTP + Анти-Брутфорс
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Шапка */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                SmartNotes AI — Панель управления
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Управление пользователями, лицензиями и выручкой
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShow2FaModal(true)}
              className="px-3.5 py-2 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 rounded-xl border border-purple-500/30 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5"
            >
              📱 2FA Аутентификатор
            </button>
            <button
              onClick={() => loadData(password, totpCode)}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs sm:text-sm font-medium transition-all flex items-center gap-2"
            >
              🔄 {loading ? "Обновление..." : "Обновить"}
            </button>
            <button
              onClick={() => setLoggedIn(false)}
              className="px-3.5 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl border border-red-500/20 text-xs sm:text-sm font-medium transition-all"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* МОДАЛКА НАСТРОЙКИ 2FA */}
        {show2FaModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <h3 className="text-lg font-bold text-white">Google Authenticator (2FA)</h3>
                </div>
                <button
                  onClick={() => setShow2FaModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <p>
                  Для включения двухфакторной защиты привяжите ключ к приложению <b>Google Authenticator</b> (или Яндекс Ключ / Microsoft Authenticator) на вашем смартфоне:
                </p>

                <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-2">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Ваш секретный ключ настройки:</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-base font-bold text-purple-300 select-all">
                      KREUWT2ZGBMUO2DGKNIVSR27GFMU242T
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("KREUWT2ZGBMUO2DGKNIVSR27GFMU242T");
                        alert("Секретный ключ скопирован в буфер обмена!");
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Копировать
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="font-bold text-slate-200 mb-1">Как добавить в телефон:</div>
                  <div>1. Откройте <b>Google Authenticator</b> на телефоне.</div>
                  <div>2. Нажмите на значок <b>«+»</b> внизу экрана ➔ выберите <b>«Ввести ключ настройки»</b>.</div>
                  <div>3. Название аккаунта: <b>SmartNotes AI</b></div>
                  <div>4. Ключ: вставьте скопированный выше ключ.</div>
                  <div>5. Тип ключа: <b>По времени (Time-based)</b> ➔ нажмите <b>«Добавить»</b>.</div>
                </div>
              </div>

              <button
                onClick={() => setShow2FaModal(false)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all"
              >
                Понятно, готово!
              </button>
            </div>
          </div>
        )}


        {/* Уведомления */}
        {message && (
          <div className="p-4 bg-slate-900 border border-purple-500/30 rounded-2xl text-slate-200 text-sm flex items-center justify-between shadow-lg">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-slate-400 hover:text-white text-xs ml-4">✕</button>
          </div>
        )}

        {/* КЛИКАБЕЛЬНЫЕ КАРТОЧКИ СТАТИСТИКИ (ФИЛЬТРЫ) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          {/* Всего */}
          <button
            onClick={() => { setActiveFilter("all"); setActiveTab("users"); }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "users" && activeFilter === "all"
                ? "bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Всего юзеров</span>
              <span className="text-lg">👥</span>
            </div>
            <div className="text-2xl font-extrabold text-white">{totalCount}</div>
            <div className="text-[11px] text-purple-400 mt-1 font-medium">
              {activeTab === "users" && activeFilter === "all" ? "● Активен" : "Показать всех"}
            </div>
          </button>

          {/* FREE */}
          <button
            onClick={() => { setActiveFilter("free"); setActiveTab("users"); }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "users" && activeFilter === "free"
                ? "bg-slate-800/80 border-slate-400 ring-2 ring-slate-400/30 shadow-lg"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">FREE</span>
              <span className="text-lg">🆓</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-300">{freeCount}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {activeTab === "users" && activeFilter === "free" ? "● Активен" : "Фильтр FREE"}
            </div>
          </button>

          {/* PRO */}
          <button
            onClick={() => { setActiveFilter("pro"); setActiveTab("users"); }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "users" && activeFilter === "pro"
                ? "bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase font-bold tracking-wider text-blue-400">PRO (Вечный)</span>
              <span className="text-lg">⚡</span>
            </div>
            <div className="text-2xl font-extrabold text-blue-300">{proCount}</div>
            <div className="text-[11px] text-blue-400 mt-1 font-medium">
              {activeTab === "users" && activeFilter === "pro" ? "● Активен" : "Фильтр PRO"}
            </div>
          </button>

          {/* PRO+ */}
          <button
            onClick={() => { setActiveFilter("pro_plus"); setActiveTab("users"); }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "users" && activeFilter === "pro_plus"
                ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">PRO+ (ИИ)</span>
              <span className="text-lg">👑</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-300">{proPlusCount}</div>
            <div className="text-[11px] text-amber-400 mt-1 font-medium">
              {activeTab === "users" && activeFilter === "pro_plus" ? "● Активен" : "Фильтр PRO+"}
            </div>
          </button>

          {/* ВЫРУЧКА / КАССА */}
          <button
            onClick={() => setActiveTab("payments")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "payments"
                ? "bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "bg-slate-900 border-slate-800 hover:border-emerald-500/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">Выручка (Касса)</span>
              <span className="text-lg">💰</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-300">
              {totalRevenue.toLocaleString("ru-RU")} ₽
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-medium">
              {payments.length} {payments.length === 1 ? "продажа" : "продаж"} • Журнал →
            </div>
          </button>

        </div>

        {/* Вкладки и Поиск */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            
            {/* Табы */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "users"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                👥 Пользователи ({filteredUsers.length})
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "payments"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-800 text-emerald-400 hover:bg-slate-700"
                }`}
              >
                💰 Платежи ({payments.length}) • <span className="font-bold">{totalRevenue.toLocaleString("ru-RU")} ₽</span>
              </button>
              <button
                onClick={() => setActiveTab("codes")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "codes"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                🔑 Коды активации ({codes.length})
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "manual"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                ➕ Выдать тариф
              </button>
            </div>

            {/* Кнопки экспорта */}
            {activeTab === "users" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyEmails}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  📋 Копировать Email ({filteredUsers.length})
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  📥 Скачать CSV
                </button>
              </div>
            )}
          </div>

          {/* ПОИСКОВАЯ СТРОКА */}
          {activeTab === "users" && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Поиск по Email адресу..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded-md"
                >
                  Очистить
                </button>
              )}
            </div>
          )}

          {/* ВКЛАДКА 1: ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ */}
          {activeTab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Email пользователя</th>
                    <th className="py-3 px-4">Тариф</th>
                    <th className="py-3 px-4">Устройства</th>
                    <th className="py-3 px-4">Дата регистрации</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Пользователи не найдены
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-200">
                          <div className="flex items-center gap-2">
                            <span>{user.email}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(user.email);
                                alert("Email скопирован!");
                              }}
                              className="text-slate-500 hover:text-slate-300 text-xs"
                              title="Копировать"
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {user.isProPlus ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              👑 PRO+ {user.daysLeft !== null && user.daysLeft !== undefined ? `(${user.daysLeft} дн.)` : '(ИИ)'}
                            </span>
                          ) : user.isPro ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                              ⚡ PRO
                            </span>
                          ) : user.isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                              ⌛ FREE (Истёк)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                              FREE
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-slate-300">
                              📱 {user.devicesCount} / {user.isPro || user.isProPlus ? 3 : 1}
                            </span>
                            {user.devices && user.devices.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {user.devices.map((d, i) => {
                                  const isWin = d.startsWith('device_win_') || d.startsWith('win_');
                                  return (
                                    <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${isWin ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`} title={d}>
                                      {isWin ? 'Windows' : 'Mobile'}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Смена тарифа */}
                            {!user.isProPlus && (
                              <button
                                onClick={() => handleSetPlan(user, "pro_plus")}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-xs transition-all"
                                title="Выдать PRO+"
                              >
                                +PRO+
                              </button>
                            )}

                            {!user.isPro && (
                              <button
                                onClick={() => handleSetPlan(user, "pro")}
                                className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded-lg text-xs transition-all"
                                title="Выдать PRO"
                              >
                                +PRO
                              </button>
                            )}

                            {(user.isPro || user.isProPlus) && (
                              <button
                                onClick={() => handleSetPlan(user, "free")}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs transition-all"
                                title="Сбросить в FREE"
                              >
                                В FREE
                              </button>
                            )}

                            {/* Кнопка УДАЛИТЬ */}
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600/30 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold transition-all ml-2"
                              title="Удалить пользователя"
                            >
                              🗑️ Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ВКЛАДКА 2: ПЛАТЕЖИ И КАССА */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">💰 Касса и журнал транзакций ЮKassa</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Все успешные реальные оплаты через СБП, карты и SberPay</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Общая выручка:</div>
                  <div className="text-xl font-extrabold text-emerald-400">{totalRevenue.toLocaleString("ru-RU")} ₽</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Дата и время</th>
                      <th className="py-3 px-4">Email покупателя</th>
                      <th className="py-3 px-4">Тариф</th>
                      <th className="py-3 px-4">Сумма</th>
                      <th className="py-3 px-4">Статус</th>
                      <th className="py-3 px-4 text-right">ID транзакции</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          Платежи пока отсутствуют
                        </td>
                      </tr>
                    ) : (
                      payments.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{idx + 1}</td>
                          <td className="py-3.5 px-4 text-xs text-slate-300">
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString("ru-RU", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-200">
                            <div className="flex items-center gap-2">
                              <span>{p.email}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(p.email);
                                  alert("Email скопирован!");
                                }}
                                className="text-slate-500 hover:text-slate-300 text-xs"
                                title="Копировать"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs uppercase px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold">
                              {p.plan === "pro"
                                ? "⚡ PRO (Вечный)"
                                : p.plan === "pro_plus_6m"
                                ? "🎁 PRO+ 6 Мес"
                                : p.plan === "pro_plus_3m"
                                ? "👑 PRO+ 3 Мес"
                                : "👑 PRO+ 1 Мес"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {parseFloat(p.amount || "0").toLocaleString("ru-RU")} {p.currency === "RUB" ? "₽" : p.currency}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                              ✅ Оплачено (ЮKassa)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500">
                            {p.paymentId ? p.paymentId.substring(0, 18) + "..." : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 3: КОДЫ АКТИВАЦИИ */}
          {activeTab === "codes" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Код</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Тариф</th>
                    <th className="py-3 px-4">Статус</th>
                    <th className="py-3 px-4">Создан</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {codes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Коды не найдены
                      </td>
                    </tr>
                  ) : (
                    codes.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-300">{c.code}</td>
                        <td className="py-3.5 px-4 text-slate-300">{c.email}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {c.plan || "PRO"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {c.isUsed ? (
                            <span className="text-xs text-slate-500">Использован</span>
                          ) : (
                            <span className="text-xs text-emerald-400 font-semibold">Активен</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("ru-RU") : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ВКЛАДКА 4: РУЧНАЯ ВЫДАЧА */}
          {activeTab === "manual" && (
            <div className="max-w-xl mx-auto p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Выдать или изменить тариф вручную</h3>
              <form onSubmit={handleManualGrant} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Email пользователя</label>
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Тариф</label>
                  <select
                    value={manualPlan}
                    onChange={(e) => setManualPlan(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="pro_plus">👑 PRO+ (ИИ Gemini Flash + 3 устройства)</option>
                    <option value="pro">⚡ PRO (Вечный доступ + 3 устройства)</option>
                    <option value="free">🆓 FREE (Сброс до базового)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !manualEmail}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-purple-600/20"
                >
                  {loading ? "Применение..." : "Применить тариф"}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

