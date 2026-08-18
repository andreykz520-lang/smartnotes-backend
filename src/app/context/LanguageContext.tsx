"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../../../messages/en.json';
import ru from '../../../messages/ru.json';
import es from '../../../messages/es.json';
import fr from '../../../messages/fr.json';
import de from '../../../messages/de.json';
import ar from '../../../messages/ar.json';

type Language = 'en' | 'ru' | 'es' | 'fr' | 'de' | 'ar';

const translations = {
  en: en.Index,
  ru: ru.Index,
  es: es.Index,
  fr: fr.Index,
  de: de.Index,
  ar: ar.Index,
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ru');

  useEffect(() => {
    const savedLang = localStorage.getItem('site_lang') as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang]) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('site_lang', lang);
  };

  const t = (key: string): string => {
    const translation = translations[language] as any;
    return translation[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
