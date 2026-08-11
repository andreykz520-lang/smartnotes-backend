"use client";

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/icon.png" 
            alt="SmartNotes AI Icon" 
            className="w-10 h-10 rounded-xl shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform border border-purple-500/40 object-cover"
          />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              SmartNotes <span className="text-purple-500">AI</span>
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex gap-4 sm:gap-6 items-center text-sm font-medium">
          <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors hidden md:block">
            {t.home}
          </Link>
          <a href="#features" className="text-slate-300 hover:text-cyan-400 transition-colors hidden md:block">
            {t.featuresNav}
          </a>
          <a href="#screenshots" className="text-slate-300 hover:text-cyan-400 transition-colors hidden md:block">
            {t.screenshotsNav}
          </a>
          <a href="#pricing" className="text-slate-300 hover:text-cyan-400 transition-colors hidden md:block">
            {t.pricingNav}
          </a>

          <Link href="/admin/management/codes" className="text-slate-400 hover:text-amber-400 text-xs font-semibold px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors hidden lg:block">
            🔐 Admin
          </Link>

          <Link href="/buy" className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/35 transition-all text-xs sm:text-sm">
            {t.buyProNav}
          </Link>

          {/* Language Switcher */}
          <button 
            onClick={toggleLang}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold uppercase border border-slate-700/80 transition-all text-slate-300 hover:text-white"
          >
            <span>🌐</span>
            <span>{lang === 'en' ? 'RU' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

