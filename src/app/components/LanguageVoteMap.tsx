"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface Candidate {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  votes: number;
  target: number;
  progress: number;
  isReached: boolean;
}

interface CurrentLang {
  code: string;
  name: string;
  flag: string;
}

export default function LanguageVoteMap() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentLangs, setCurrentLangs] = useState<CurrentLang[]>([]);
  const [userVotedLang, setUserVotedLang] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingCode, setVotingCode] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [celebrationModal, setCelebrationModal] = useState<{ name: string; flag: string; votes: number } | null>(null);

  // Generate or read persistent deviceId for vote anti-cheat
  const getDeviceId = () => {
    if (typeof window === "undefined") return "server";
    let id = localStorage.getItem("smartnotes_voter_device_id");
    if (!id) {
      id = "dev_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("smartnotes_voter_device_id", id);
    }
    return id;
  };

  const loadVotes = async () => {
    try {
      const deviceId = getDeviceId();
      const localVoted = typeof window !== "undefined" ? localStorage.getItem("smartnotes_voted_lang") : null;
      if (localVoted) setUserVotedLang(localVoted);

      const res = await fetch(`/api/language-vote?deviceId=${encodeURIComponent(deviceId)}`);
      const data = await res.json();
      if (data.success) {
        setCandidates(data.languages || []);
        setCurrentLangs(data.currentLanguages || []);
        if (data.userVotedLang) {
          setUserVotedLang(data.userVotedLang);
          localStorage.setItem("smartnotes_voted_lang", data.userVotedLang);
        }
      }
    } catch (e) {
      console.warn("Failed to load language votes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVotes();
  }, []);

  const triggerFireworks = () => {
    // 1. Первая волна: яркий салют
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#a855f7", "#ec4899", "#3b82f6", "#f59e0b", "#10b981", "#ffffff"]
    });

    // 2. Вторая волна: золотые звёздочки через 250мс
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ffd700", "#ff7b00", "#a855f7"]
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ffd700", "#ff7b00", "#3b82f6"]
      });
    }, 250);
  };

  const handleVote = async (cand: Candidate) => {
    if (userVotedLang) return;
    setVotingCode(cand.code);

    try {
      const deviceId = getDeviceId();
      const res = await fetch("/api/language-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languageCode: cand.code,
          languageName: cand.name,
          countryFlag: cand.flag,
          deviceId
        })
      });

      const data = await res.json();
      if (data.success) {
        setUserVotedLang(cand.code);
        localStorage.setItem("smartnotes_voted_lang", cand.code);
        
        // Обновляем локальный список
        setCandidates(prev => prev.map(c => {
          if (c.code === cand.code) {
            const newVotes = data.votes || c.votes + 1;
            return {
              ...c,
              votes: newVotes,
              progress: Math.min(100, Math.round((newVotes / c.target) * 100)),
              isReached: newVotes >= c.target
            };
          }
          return c;
        }));

        triggerFireworks();
        setCelebrationModal({
          name: cand.name,
          flag: cand.flag,
          votes: data.votes || cand.votes + 1
        });
      } else if (data.alreadyVoted) {
        setUserVotedLang(data.votedLanguage || cand.code);
        localStorage.setItem("smartnotes_voted_lang", data.votedLanguage || cand.code);
        alert(data.message || "Вы уже проголосовали с этого устройства!");
      }
    } catch (e) {
      alert("Не удалось отправить голос. Пожалуйста, проверьте интернет.");
    } finally {
      setVotingCode(null);
    }
  };

  // Фильтрация
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.nativeName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "all") return true;
    if (activeFilter === "asia") return c.region.includes("Азия");
    if (activeFilter === "europe") return c.region.includes("Европа");
    return true;
  });

  return (
    <section id="languages-vote" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0D0D12] border-t border-b border-white/5 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-[400px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4">
            <span>🌍</span>
            <span>Голосование Сообщества</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Какой следующий язык <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">добавить в приложение?</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            Каждый голос имеет значение! Наша цель — <strong className="text-yellow-400 font-semibold">50 голосов 🎯</strong>. 
            Язык, первым набравший эту планку, будет сразу переведён и внедрён в SmartNotes AI в ближайшем обновлении!
          </p>
        </div>

        {/* Current active languages badge */}
        <div className="mb-12 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Уже в приложении (на 6 языках):</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {currentLangs.map(l => (
                <span key={l.code} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-medium">
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                  <span className="text-emerald-400">✓</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Stylized Map Section */}
        <div className="relative mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 overflow-hidden">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Интерактивная карта интереса</span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">Голоса распределяются по всему миру</h3>
          </div>

          {/* Stylized SVG World Map */}
          <div className="relative w-full max-w-4xl mx-auto aspect-[2/1] rounded-2xl bg-[#09090E] border border-white/5 flex items-center justify-center overflow-hidden">
            {/* World Map SVG paths silhouette */}
            <svg viewBox="0 0 1000 500" className="w-full h-full opacity-30 pointer-events-none select-none">
              {/* North America */}
              <path d="M150,120 Q180,90 220,110 Q280,130 250,180 Q210,230 170,200 Q130,160 150,120 Z" fill="#6366f1" />
              {/* South America */}
              <path d="M280,260 Q340,280 320,370 Q280,440 250,380 Q240,300 280,260 Z" fill="#8b5cf6" />
              {/* Europe */}
              <path d="M480,110 Q540,90 560,130 Q540,170 490,160 Q460,130 480,110 Z" fill="#a855f7" />
              {/* Africa */}
              <path d="M500,190 Q580,200 560,310 Q520,380 470,300 Q460,220 500,190 Z" fill="#ec4899" />
              {/* Asia & Russia */}
              <path d="M580,100 Q750,70 850,120 Q880,200 780,240 Q650,230 580,160 Z" fill="#3b82f6" />
              {/* Australia */}
              <path d="M780,330 Q860,320 850,390 Q780,420 760,360 Z" fill="#10b981" />
            </svg>

            {/* Glowing Map Pins for Candidate languages */}
            <div className="absolute inset-0 pointer-events-none">
              {/* China */}
              <div className="absolute top-[32%] left-[73%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="text-xl">🇨🇳</span>
                <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/80 text-white shadow-lg">Китай</span>
              </div>
              {/* Turkey */}
              <div className="absolute top-[33%] left-[54%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.4s' }}>
                <span className="text-xl">🇹🇷</span>
                <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/80 text-white shadow-lg">Турция</span>
              </div>
              {/* Kazakhstan */}
              <div className="absolute top-[26%] left-[62%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '2.8s' }}>
                <span className="text-xl">🇰🇿</span>
                <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/80 text-white shadow-lg">Казахстан</span>
              </div>
              {/* Japan */}
              <div className="absolute top-[34%] left-[84%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.2s' }}>
                <span className="text-xl">🇯🇵</span>
                <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/80 text-white shadow-lg">Япония</span>
              </div>
              {/* Italy */}
              <div className="absolute top-[28%] left-[49%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.6s' }}>
                <span className="text-xl">🇮🇹</span>
                <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/80 text-white shadow-lg">Италия</span>
              </div>
              {/* Brazil */}
              <div className="absolute top-[65%] left-[30%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.8s' }}>
                <span className="text-xl">🇧🇷</span>
                <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/80 text-white shadow-lg">Бразилия</span>
              </div>
            </div>

            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-gray-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
              <span>🎯 Цель: 50 голосов для интеграции</span>
              <span>Лидер голосования: {candidates[0]?.name || "Загрузка..."} ({candidates[0]?.votes || 0} / 50)</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === "all" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              Все языки ({candidates.length})
            </button>
            <button
              onClick={() => setActiveFilter("asia")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === "asia" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              Азия
            </button>
            <button
              onClick={() => setActiveFilter("europe")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === "europe" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              Европа
            </button>
          </div>

          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder="Поиск языка..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-white text-sm">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Voting Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map((cand, idx) => {
            const isVotedByMe = userVotedLang === cand.code;
            const isLeader = idx === 0;

            return (
              <div
                key={cand.code}
                className={`relative p-5 sm:p-6 rounded-2xl transition-all duration-300 border flex flex-col justify-between ${
                  isVotedByMe
                    ? "bg-purple-950/30 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
                    : isLeader
                    ? "bg-gradient-to-b from-white/[0.07] to-white/[0.02] border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                    : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                {/* Leader Badge */}
                {isLeader && (
                  <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1">
                    <span>👑</span>
                    <span>Лидер</span>
                  </div>
                )}

                {/* Voted badge */}
                {isVotedByMe && (
                  <div className="absolute -top-3 left-5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1">
                    <span>✓</span>
                    <span>Ваш голос</span>
                  </div>
                )}

                <div>
                  {/* Top row: Flag & Names */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl select-none">{cand.flag}</span>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white leading-tight">
                          {cand.name}
                        </h4>
                        <span className="text-xs text-gray-400">{cand.nativeName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5 whitespace-nowrap">
                      {cand.region}
                    </span>
                  </div>

                  {/* Progress info */}
                  <div className="mt-4 mb-2 flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium">
                      Собрано: <strong className="text-white font-bold">{cand.votes}</strong> из {cand.target}
                    </span>
                    <span className="font-bold text-purple-300">
                      {cand.progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isLeader
                          ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400"
                          : isVotedByMe
                          ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                          : "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(8, cand.progress))}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500 text-right">
                    Осталось {Math.max(0, cand.target - cand.votes)} голосов до цели
                  </div>
                </div>

                {/* Vote Action Button */}
                <div className="mt-5 pt-4 border-t border-white/5">
                  {isVotedByMe ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-default"
                    >
                      <span>✓</span>
                      <span>Вы отдали голос за этот язык</span>
                    </button>
                  ) : userVotedLang ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-white/5 text-gray-500 text-xs sm:text-sm font-medium cursor-not-allowed"
                    >
                      Голос уже отдан
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVote(cand)}
                      disabled={Boolean(votingCode)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>🗳️</span>
                      <span>{votingCode === cand.code ? "Отправка..." : "Проголосовать"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggest custom language note */}
        <div className="mt-12 text-center text-xs text-gray-500">
          💡 Не нашли свой язык в списке? Напишите нам в поддержку <a href="mailto:support@smartnotes-ai.ru" className="text-purple-400 hover:underline">support@smartnotes-ai.ru</a> или в Telegram <a href="https://t.me/SmartNotesAIBot" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">@SmartNotesAIBot</a>, и мы добавим его на голосование!
        </div>
      </div>

      {/* Celebration Modal / Toast */}
      {celebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#13131A] border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.35)] text-center">
            <div className="text-5xl mb-3">{celebrationModal.flag} 🎉</div>
            <h3 className="text-2xl font-extrabold text-white mb-2">
              Спасибо за ваш голос!
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Ваш голос за <strong className="text-purple-400">{celebrationModal.name}</strong> успешно учтён! Теперь у него <strong className="text-yellow-400 font-bold">{celebrationModal.votes} из 50 голосов</strong>.
            </p>
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 mb-6">
              🚀 Как только наберётся 50 голосов, язык сразу будет добавлен в обновление SmartNotes AI!
            </div>
            <button
              onClick={() => setCelebrationModal(null)}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30"
            >
              Отлично, понятно!
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
