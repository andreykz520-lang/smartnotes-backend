"use client";

import { useEffect } from 'react';

export default function BuyRedirect() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      window.location.replace(`/${search}#checkout`);
    }
  }, []);

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen flex items-center justify-center font-sans">
      <div className="animate-pulse text-purple-400 font-medium text-sm">
        Загрузка тарифов SmartNotes...
      </div>
    </div>
  );
}