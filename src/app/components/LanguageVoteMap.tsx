"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useLanguage } from "../context/LanguageContext";
import Globe3D from "./Globe3D";

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

const LOCALIZED_CANDIDATE_NAMES: Record<string, Record<string, string>> = {
  zh: { ru: "Китайский", en: "Chinese", de: "Chinesisch", es: "Chino", fr: "Chinois", ar: "الصينية" },
  tr: { ru: "Турецкий", en: "Turkish", de: "Türkisch", es: "Turco", fr: "Turc", ar: "التركية" },
  kk: { ru: "Казахский", en: "Kazakh", de: "Kasachisch", es: "Kazajo", fr: "Kazakh", ar: "الكازاخستانية" },
  ja: { ru: "Японский", en: "Japanese", de: "Japanisch", es: "Japonés", fr: "Japonais", ar: "اليابانية" },
  it: { ru: "Итальянский", en: "Italian", de: "Italienisch", es: "Italiano", fr: "Italien", ar: "الإيطالية" },
  pt: { ru: "Португальский", en: "Portuguese", de: "Portugiesisch", es: "Portugués", fr: "Portugais", ar: "البرتغالية" },
  uz: { ru: "Узбекский", en: "Uzbek", de: "Usbekisch", es: "Uzbeko", fr: "Ouzbek", ar: "الأوزبكية" },
  ko: { ru: "Корейский", en: "Korean", de: "Koreanisch", es: "Coreano", fr: "Coréen", ar: "الكورية" },
  pl: { ru: "Польский", en: "Polish", de: "Polnisch", es: "Polaco", fr: "Polonais", ar: "البولندية" },
  hi: { ru: "Хинди", en: "Hindi", de: "Hindi", es: "Hindi", fr: "Hindi", ar: "الهندية" },
  vi: { ru: "Вьетнамский", en: "Vietnamese", de: "Vietnamesisch", es: "Vietnamita", fr: "Vietnamien", ar: "الفيتنامية" },
  uk: { ru: "Украинский", en: "Ukrainian", de: "Ukrainisch", es: "Ucraniano", fr: "Ukrainien", ar: "الأوكرانية" },
};

const LOCALIZED_CURRENT_LANGS: Record<string, Record<string, string>> = {
  ru: { ru: "Русский", en: "Russian", de: "Russisch", es: "Ruso", fr: "Russe", ar: "الروسية" },
  en: { ru: "English", en: "English", de: "Englisch", es: "Inglés", fr: "Anglais", ar: "الإنجليزية" },
  de: { ru: "Deutsch", en: "German", de: "Deutsch", es: "Alemán", fr: "Allemand", ar: "الألمانية" },
  es: { ru: "Español", en: "Spanish", de: "Spanisch", es: "Español", fr: "Espagnol", ar: "الإسبانية" },
  fr: { ru: "Français", en: "French", de: "Französisch", es: "Francés", fr: "Français", ar: "الفرنسية" },
  ar: { ru: "العربية", en: "Arabic", de: "Arabisch", es: "Árabe", fr: "Arabe", ar: "العربية" },
};

const LOCALIZED_REGIONS: Record<string, Record<string, string>> = {
  "Восточная Азия": { ru: "Восточная Азия", en: "East Asia", de: "Ostasien", es: "Asia Oriental", fr: "Asie de l'Est", ar: "شرق آسيا" },
  "Ближний Восток": { ru: "Ближний Восток", en: "Middle East", de: "Mittlerer Osten", es: "Medio Oriente", fr: "Moyen-Orient", ar: "الشرق الأوسط" },
  "Центральная Азия": { ru: "Центральная Азия", en: "Central Asia", de: "Zentralasien", es: "Asia Central", fr: "Asie Centrale", ar: "آسيا الوسطى" },
  "Южная Европа": { ru: "Южная Европа", en: "Southern Europe", de: "Südeuropa", es: "Sur de Europa", fr: "Europe du Sud", ar: "جنوب أوروبا" },
  "Южная Америка / Европа": { ru: "Юж. Америка / Европа", en: "S. America / Europe", de: "Südamerika / Europa", es: "Sudamérica / Europa", fr: "Amérique du Sud / Europe", ar: "أمريكا الجنوبية / أوروبا" },
  "Восточная Европа": { ru: "Восточная Европа", en: "Eastern Europe", de: "Osteuropa", es: "Europa del Este", fr: "Europe de l'Est", ar: "أوروبا الشرقية" },
  "Южная Азия": { ru: "Южная Азия", en: "South Asia", de: "Südasien", es: "Asia del Sur", fr: "Asie du Sud", ar: "جنوب آسيا" },
  "Юго-Восточная Азия": { ru: "Юго-Восточная Азия", en: "Southeast Asia", de: "Südostasien", es: "Sudeste Asiático", fr: "Asie du Sud-Est", ar: "جنوب شرق آسيا" },
};

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  zh: [39.9, 116.4],
  tr: [39.0, 35.2],
  kk: [51.16, 71.47],
  ja: [35.67, 139.65],
  it: [41.9, 12.5],
  pt: [-14.23, -51.92],
  uz: [41.29, 69.24],
  ko: [37.56, 126.97],
  pl: [52.22, 21.01],
  hi: [28.61, 77.2],
  vi: [21.02, 105.83],
  uk: [50.45, 30.52],
  ru: [55.75, 37.61],
  en: [51.5, -0.12],
  de: [52.52, 13.4],
  es: [40.41, -3.7],
  fr: [48.85, 2.35],
  ar: [24.45, 54.37],
};

const UI_STRINGS: Record<string, Record<string, string>> = {
  badge: {
    ru: "Голосование Сообщества",
    en: "Community Vote",
    de: "Community-Abstimmung",
    es: "Votación de la Comunidad",
    fr: "Vote de la Communauté",
    ar: "تصويت المجتمع",
  },
  title_start: {
    ru: "Какой следующий язык",
    en: "Which language should we",
    de: "Welche Sprache sollen wir",
    es: "¿Qué idioma deberíamos",
    fr: "Quelle langue devrions-nous",
    ar: "ما هي اللغة التالية التي",
  },
  title_highlight: {
    ru: "добавить в приложение?",
    en: "add to the app next?",
    de: "als Nächstes hinzufügen?",
    es: "agregar a la aplicación?",
    fr: "ajouter ensuite à l'application ?",
    ar: "نضيفها إلى التطبيق؟",
  },
  subtitle: {
    ru: "Каждый голос имеет значение! Наша цель — 50 голосов 🎯. Язык, первым набравший эту планку, будет сразу переведён и внедрён в SmartNotes AI в ближайшем обновлении!",
    en: "Every vote counts! Our goal is 50 votes 🎯. The language that reaches this milestone first will be translated and integrated into SmartNotes AI in the upcoming update!",
    de: "Jede Stimme zählt! Unser Ziel sind 50 Stimmen 🎯. Die Sprache, die diesen Meilenstein zuerst erreicht, wird sofort übersetzt und im nächsten Update implementiert!",
    es: "¡Cada voto cuenta! Nuestro objetivo son 50 votos 🎯. ¡El idioma que alcance esta meta primero se traducirá e integrará en la próxima actualización de SmartNotes AI!",
    fr: "Chaque vote compte ! Notre objectif est de 50 votes 🎯. La langue qui atteindra ce palier en premier sera traduite et intégrée dans la prochaine mise à jour de SmartNotes AI !",
    ar: "كل صوت له أهمية! هدفنا هو 50 صوتاً 🎯. اللغة التي تصل إلى هذا الهدف أولاً ستتم ترجمتها وإضافتها إلى SmartNotes AI في التحديث القادم!",
  },
  already_in_app: {
    ru: "Уже в приложении (на 6 языках):",
    en: "Already in the app (6 languages):",
    de: "Bereits in der App (6 Sprachen):",
    es: "Ya en la app (6 idiomas):",
    fr: "Déjà dans l'application (6 langues) :",
    ar: "متوفر بالفعل في التطبيق (6 لغات):",
  },
  map_badge: {
    ru: "Интерактивный 3D Глобус",
    en: "Interactive 3D Globe",
    de: "Interaktiver 3D-Globus",
    es: "Globo Interactivo 3D",
    fr: "Globe 3D Interactif",
    ar: "كرة أرضية تفاعلية ثلاثية الأبعاد",
  },
  map_title: {
    ru: "Вращайте глобус и исследуйте голоса по странам",
    en: "Rotate the globe and explore votes by country",
    de: "Drehen Sie den Globus und entdecken Sie Stimmen",
    es: "Gira el globo y explora los votos por país",
    fr: "Faites tourner le globe et explorez les votes par pays",
    ar: "قم بتدوير الكرة الأرضية واستكشف الأصوات حسب البلد",
  },
  view_globe: {
    ru: "🌐 3D Глобус",
    en: "🌐 3D Globe",
    de: "🌐 3D-Globus",
    es: "🌐 Globo 3D",
    fr: "🌐 Globe 3D",
    ar: "🌐 كرة 3D",
  },
  view_flat: {
    ru: "🗺️ Плоская карта",
    en: "🗺️ Flat Map",
    de: "🗺️ Flache Karte",
    es: "🗺️ Mapa Plano",
    fr: "🗺️ Carte Plate",
    ar: "🗺️ خريطة مسطحة",
  },
  pause: {
    ru: "Пауза",
    en: "Pause",
    de: "Pause",
    es: "Pausar",
    fr: "Pause",
    ar: "إيقاف",
  },
  play: {
    ru: "Вращать",
    en: "Spin",
    de: "Drehen",
    es: "Girar",
    fr: "Tourner",
    ar: "تدوير",
  },
  dragTip: {
    ru: "Удерживайте и тяните для вращения в любую сторону",
    en: "Click and drag to rotate the globe freely",
    de: "Klicken und ziehen, um den Globus zu drehen",
    es: "Arrastra para girar el globo libremente",
    fr: "Cliquez et faites glisser pour faire tourner le globe",
    ar: "انقر واسحب لتدوير الكرة الأرضية بحرية",
  },
  activeBadge: {
    ru: "Уже в приложении",
    en: "Already in app",
    de: "Bereits in der App",
    es: "Ya en la app",
    fr: "Déjà dans l'app",
    ar: "متوفر بالفعل",
  },
  votesOf: {
    ru: "из",
    en: "of",
    de: "von",
    es: "de",
    fr: "sur",
    ar: "من",
  },
  map_goal: {
    ru: "🎯 Цель: 50 голосов для интеграции",
    en: "🎯 Goal: 50 votes for integration",
    de: "🎯 Ziel: 50 Stimmen für die Integration",
    es: "🎯 Meta: 50 votos para integración",
    fr: "🎯 Objectif : 50 votes pour intégration",
    ar: "🎯 الهدف: 50 صوتاً للإدراج",
  },
  map_leader: {
    ru: "Лидер голосования:",
    en: "Vote leader:",
    de: "Führende Sprache:",
    es: "Líder de la votación:",
    fr: "En tête des votes :",
    ar: "متصدر التصويت:",
  },
  filter_all: {
    ru: "Все языки",
    en: "All languages",
    de: "Alle Sprachen",
    es: "Todos los idiomas",
    fr: "Toutes les langues",
    ar: "جميع اللغات",
  },
  filter_asia: {
    ru: "Азия",
    en: "Asia",
    de: "Asien",
    es: "Asia",
    fr: "Asie",
    ar: "آسيا",
  },
  filter_europe: {
    ru: "Европа",
    en: "Europe",
    de: "Europa",
    es: "Europa",
    fr: "Europe",
    ar: "أوروبا",
  },
  search_placeholder: {
    ru: "Поиск языка...",
    en: "Search language...",
    de: "Sprache suchen...",
    es: "Buscar idioma...",
    fr: "Rechercher une langue...",
    ar: "البحث عن لغة...",
  },
  leader_badge: {
    ru: "Лидер",
    en: "Leader",
    de: "Führend",
    es: "Líder",
    fr: "En tête",
    ar: "المتصدر",
  },
  your_vote: {
    ru: "Ваш голос",
    en: "Your vote",
    de: "Ihre Stimme",
    es: "Tu voto",
    fr: "Votre vote",
    ar: "صوتك",
  },
  collected: {
    ru: "Собрано:",
    en: "Collected:",
    de: "Gesammelt:",
    es: "Recolectado:",
    fr: "Collecté :",
    ar: "تم جمع:",
  },
  of_target: {
    ru: "из",
    en: "of",
    de: "von",
    es: "de",
    fr: "sur",
    ar: "من",
  },
  remaining_prefix: {
    ru: "Осталось",
    en: "Remaining:",
    de: "Noch",
    es: "Faltan",
    fr: "Plus que",
    ar: "متبقي",
  },
  remaining_suffix: {
    ru: "голосов до цели",
    en: "votes to goal",
    de: "Stimmen bis zum Ziel",
    es: "votos para la meta",
    fr: "votes jusqu'à l'objectif",
    ar: "أصوات للوصول للهدف",
  },
  btn_voted_this: {
    ru: "Вы отдали голос за этот язык",
    en: "You voted for this language",
    de: "Sie haben für diese Sprache gestimmt",
    es: "Has votado por este idioma",
    fr: "Vous avez voté pour cette langue",
    ar: "لقد صوتت لهذه اللغة",
  },
  btn_voted_other: {
    ru: "Голос уже отдан",
    en: "Vote already submitted",
    de: "Stimme bereits abgegeben",
    es: "Voto ya emitido",
    fr: "Vote déjà enregistré",
    ar: "تم التصويت مسبقاً",
  },
  btn_vote: {
    ru: "Проголосовать",
    en: "Vote",
    de: "Abstimmen",
    es: "Votar",
    fr: "Voter",
    ar: "تصويت",
  },
  btn_voting: {
    ru: "Отправка...",
    en: "Submitting...",
    de: "Senden...",
    es: "Enviando...",
    fr: "Envoi...",
    ar: "جاري الإرسال...",
  },
  not_found_note: {
    ru: "💡 Не нашли свой язык в списке? Напишите нам в поддержку support@smartnotes-ai.ru или в Telegram @SmartNotesAIBot, и мы добавим его на голосование!",
    en: "💡 Didn't find your language in the list? Contact support at support@smartnotes-ai.ru or Telegram @SmartNotesAIBot, and we will add it to the vote!",
    de: "💡 Haben Sie Ihre Sprache nicht gefunden? Schreiben Sie uns an support@smartnotes-ai.ru oder Telegram @SmartNotesAIBot!",
    es: "💡 ¿No encontraste tu idioma? Escríbenos a support@smartnotes-ai.ru o en Telegram @SmartNotesAIBot, ¡y lo agregaremos a la votación!",
    fr: "💡 Vous n'avez pas trouvé votre langue ? Contactez le support à support@smartnotes-ai.ru ou Telegram @SmartNotesAIBot, nous l'ajouterons au vote !",
    ar: "💡 لم تجد لغتك في القائمة؟ راسلنا على support@smartnotes-ai.ru أو عبر تيليجرام @SmartNotesAIBot وسنضيفها للتصويت!",
  },
  modal_title: {
    ru: "Спасибо за ваш голос!",
    en: "Thank you for your vote!",
    de: "Danke für Ihre Stimme!",
    es: "¡Gracias por tu voto!",
    fr: "Merci pour votre vote !",
    ar: "شكراً لتصويتك!",
  },
  modal_tip: {
    ru: "🚀 Как только наберётся 50 голосов, язык сразу будет добавлен в обновление SmartNotes AI!",
    en: "🚀 As soon as 50 votes are reached, this language will be added in the next SmartNotes AI update!",
    de: "🚀 Sobald 50 Stimmen erreicht sind, wird diese Sprache im nächsten SmartNotes AI Update hinzugefügt!",
    es: "🚀 ¡Tan pronto como se alcancen los 50 votos, este idioma se agregará en la próxima actualización de SmartNotes AI!",
    fr: "🚀 Dès que 50 votes seront atteints, cette langue sera ajoutée dans la prochaine mise à jour de SmartNotes AI !",
    ar: "🚀 بمجرد الوصول إلى 50 صوتاً، ستتم إضافة هذه اللغة في التحديث القادم لـ SmartNotes AI!",
  },
  modal_close: {
    ru: "Отлично, понятно!",
    en: "Awesome, got it!",
    de: "Alles klar!",
    es: "¡Genial, entendido!",
    fr: "Super, compris !",
    ar: "رائع، فهمت!",
  },
};

export default function LanguageVoteMap() {
  const { language } = useLanguage();
  const currentLang = (language || 'ru') as 'ru' | 'en' | 'de' | 'es' | 'fr' | 'ar';
  const isRtl = currentLang === 'ar';

  const tStr = (key: string): string => {
    return UI_STRINGS[key]?.[currentLang] || UI_STRINGS[key]?.['en'] || UI_STRINGS[key]?.['ru'] || key;
  };

  const getCandidateName = (code: string, fallback: string): string => {
    return LOCALIZED_CANDIDATE_NAMES[code]?.[currentLang] || fallback;
  };

  const getCurrentLangName = (code: string, fallback: string): string => {
    return LOCALIZED_CURRENT_LANGS[code]?.[currentLang] || fallback;
  };

  const getRegionName = (reg: string): string => {
    return LOCALIZED_REGIONS[reg]?.[currentLang] || reg;
  };

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentLangs, setCurrentLangs] = useState<CurrentLang[]>([]);
  const [userVotedLang, setUserVotedLang] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingCode, setVotingCode] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"globe" | "flat">("globe");
  const [celebrationModal, setCelebrationModal] = useState<{ name: string; flag: string; votes: number } | null>(null);

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
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#a855f7", "#ec4899", "#3b82f6", "#f59e0b", "#10b981", "#ffffff"]
    });

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
          name: getCandidateName(cand.code, cand.name),
          flag: cand.flag,
          votes: data.votes || cand.votes + 1
        });
      } else if (data.alreadyVoted) {
        setUserVotedLang(data.votedLanguage || cand.code);
        localStorage.setItem("smartnotes_voted_lang", data.votedLanguage || cand.code);
        alert(data.message || tStr("btn_voted_other"));
      }
    } catch (e) {
      alert("Network error. Please try again.");
    } finally {
      setVotingCode(null);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const locName = getCandidateName(c.code, c.name).toLowerCase();
    const matchesSearch = locName.includes(searchQuery.toLowerCase()) ||
                          c.nativeName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "all") return true;
    if (activeFilter === "asia") return c.region.includes("Азия");
    if (activeFilter === "europe") return c.region.includes("Европа");
    return true;
  });

  // Prepare 3D Globe Markers
  const globeMarkers = [
    ...currentLangs.map(l => {
      const coords = COUNTRY_COORDINATES[l.code] || [50, 10];
      return {
        id: l.code,
        code: l.code,
        name: getCurrentLangName(l.code, l.name),
        flag: l.flag,
        lat: coords[0],
        lng: coords[1],
        isCurrent: true
      };
    }),
    ...candidates.map(c => {
      const coords = COUNTRY_COORDINATES[c.code] || [20, 20];
      return {
        id: c.code,
        code: c.code,
        name: getCandidateName(c.code, c.name),
        flag: c.flag,
        lat: coords[0],
        lng: coords[1],
        votes: c.votes,
        target: c.target,
        isCurrent: false
      };
    })
  ];

  return (
    <section 
      id="languages-vote" 
      dir={isRtl ? "rtl" : "ltr"}
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0D0D12] border-t border-b border-white/5 overflow-hidden"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-[400px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4">
            <span>🌍</span>
            <span>{tStr("badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {tStr("title_start")}{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              {tStr("title_highlight")}
            </span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            {tStr("subtitle")}
          </p>
        </div>

        {/* Current active languages badge */}
        <div className="mb-12 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{tStr("already_in_app")}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {currentLangs.map(l => (
                <span key={l.code} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-medium">
                  <span>{l.flag}</span>
                  <span>{getCurrentLangName(l.code, l.name)}</span>
                  <span className="text-emerald-400">✓</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3D GLOBE / FLAT MAP SECTION */}
        <div className="relative mb-12 p-4 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">{tStr("map_badge")}</span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">{tStr("map_title")}</h3>
            </div>

            {/* Toggle View: 3D Globe vs Flat Map */}
            <div className="inline-flex p-1 rounded-xl bg-black/40 border border-white/10">
              <button
                onClick={() => setViewMode("globe")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "globe" ? "bg-purple-600 text-white shadow-md shadow-purple-600/30" : "text-gray-400 hover:text-white"
                }`}
              >
                {tStr("view_globe")}
              </button>
              <button
                onClick={() => setViewMode("flat")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "flat" ? "bg-purple-600 text-white shadow-md shadow-purple-600/30" : "text-gray-400 hover:text-white"
                }`}
              >
                {tStr("view_flat")}
              </button>
            </div>
          </div>

          {/* VIEW 1: 3D ROTATING INTERACTIVE GLOBE */}
          {viewMode === "globe" ? (
            <Globe3D
              markers={globeMarkers}
              selectedCode={userVotedLang}
              onSelectLanguage={(code) => {
                const targetCand = candidates.find(c => c.code === code);
                if (targetCand) handleVote(targetCand);
              }}
              labels={{
                pause: tStr("pause"),
                play: tStr("play"),
                dragTip: tStr("dragTip"),
                activeBadge: tStr("activeBadge"),
                voteBtn: tStr("btn_vote"),
                votesOf: tStr("votesOf"),
              }}
            />
          ) : (
            /* VIEW 2: FLAT MAP */
            <div className="relative w-full max-w-4xl mx-auto aspect-[2/1] rounded-2xl bg-[#09090E] border border-white/5 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 1000 500" className="w-full h-full opacity-30 pointer-events-none select-none">
                <path d="M150,120 Q180,90 220,110 Q280,130 250,180 Q210,230 170,200 Q130,160 150,120 Z" fill="#6366f1" />
                <path d="M280,260 Q340,280 320,370 Q280,440 250,380 Q240,300 280,260 Z" fill="#8b5cf6" />
                <path d="M480,110 Q540,90 560,130 Q540,170 490,160 Q460,130 480,110 Z" fill="#a855f7" />
                <path d="M500,190 Q580,200 560,310 Q520,380 470,300 Q460,220 500,190 Z" fill="#ec4899" />
                <path d="M580,100 Q750,70 850,120 Q880,200 780,240 Q650,230 580,160 Z" fill="#3b82f6" />
                <path d="M780,330 Q860,320 850,390 Q780,420 760,360 Z" fill="#10b981" />
              </svg>

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[32%] left-[73%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3s' }}>
                  <span className="text-xl">🇨🇳</span>
                  <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/80 text-white shadow-lg">China</span>
                </div>
                <div className="absolute top-[33%] left-[54%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.4s' }}>
                  <span className="text-xl">🇹🇷</span>
                  <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/80 text-white shadow-lg">Türkiye</span>
                </div>
                <div className="absolute top-[26%] left-[62%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '2.8s' }}>
                  <span className="text-xl">🇰🇿</span>
                  <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/80 text-white shadow-lg">Qazaqstan</span>
                </div>
                <div className="absolute top-[34%] left-[84%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.2s' }}>
                  <span className="text-xl">🇯🇵</span>
                  <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/80 text-white shadow-lg">Nippon</span>
                </div>
                <div className="absolute top-[28%] left-[49%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.6s' }}>
                  <span className="text-xl">🇮🇹</span>
                  <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/80 text-white shadow-lg">Italia</span>
                </div>
                <div className="absolute top-[65%] left-[30%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.8s' }}>
                  <span className="text-xl">🇧🇷</span>
                  <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/80 text-white shadow-lg">Brasil</span>
                </div>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-gray-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                <span>{tStr("map_goal")}</span>
                <span>{tStr("map_leader")} {getCandidateName(candidates[0]?.code, candidates[0]?.name || "")} ({candidates[0]?.votes || 0} / 50)</span>
              </div>
            </div>
          )}
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
              {tStr("filter_all")} ({candidates.length})
            </button>
            <button
              onClick={() => setActiveFilter("asia")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === "asia" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {tStr("filter_asia")}
            </button>
            <button
              onClick={() => setActiveFilter("europe")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === "europe" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {tStr("filter_europe")}
            </button>
          </div>

          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder={tStr("search_placeholder")}
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
            const locName = getCandidateName(cand.code, cand.name);
            const locRegion = getRegionName(cand.region);

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
                    <span>{tStr("leader_badge")}</span>
                  </div>
                )}

                {/* Voted badge */}
                {isVotedByMe && (
                  <div className="absolute -top-3 left-5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1">
                    <span>✓</span>
                    <span>{tStr("your_vote")}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl select-none">{cand.flag}</span>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white leading-tight">
                          {locName}
                        </h4>
                        <span className="text-xs text-gray-400">{cand.nativeName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5 whitespace-nowrap">
                      {locRegion}
                    </span>
                  </div>

                  <div className="mt-4 mb-2 flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium">
                      {tStr("collected")} <strong className="text-white font-bold">{cand.votes}</strong> {tStr("of_target")} {cand.target}
                    </span>
                    <span className="font-bold text-purple-300">
                      {cand.progress}%
                    </span>
                  </div>

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
                    {tStr("remaining_prefix")} {Math.max(0, cand.target - cand.votes)} {tStr("remaining_suffix")}
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
                      <span>{tStr("btn_voted_this")}</span>
                    </button>
                  ) : userVotedLang ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-white/5 text-gray-500 text-xs sm:text-sm font-medium cursor-not-allowed"
                    >
                      {tStr("btn_voted_other")}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVote(cand)}
                      disabled={Boolean(votingCode)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>🗳️</span>
                      <span>{votingCode === cand.code ? tStr("btn_voting") : tStr("btn_vote")}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggest custom language note */}
        <div className="mt-12 text-center text-xs text-gray-500">
          {tStr("not_found_note")}
        </div>
      </div>

      {/* Celebration Modal / Toast */}
      {celebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#13131A] border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.35)] text-center">
            <div className="text-5xl mb-3">{celebrationModal.flag} 🎉</div>
            <h3 className="text-2xl font-extrabold text-white mb-2">
              {tStr("modal_title")}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {tStr("modal_title")}{" "}
              <strong className="text-purple-400">{celebrationModal.name}</strong> ({celebrationModal.votes} / 50).
            </p>
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 mb-6">
              {tStr("modal_tip")}
            </div>
            <button
              onClick={() => setCelebrationModal(null)}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30"
            >
              {tStr("modal_close")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
