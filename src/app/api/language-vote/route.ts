import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

// Базовые языки-кандидаты с реалистичными стартовыми голосами
const DEFAULT_CANDIDATES: Record<string, { name: string; nativeName: string; flag: string; region: string; baseVotes: number }> = {
  zh: { name: "Китайский", nativeName: "中文 (Chinese)", flag: "🇨🇳", region: "Восточная Азия", baseVotes: 36 },
  tr: { name: "Турецкий", nativeName: "Türkçe (Turkish)", flag: "🇹🇷", region: "Ближний Восток", baseVotes: 31 },
  kk: { name: "Казахский", nativeName: "Қазақша (Kazakh)", flag: "🇰🇿", region: "Центральная Азия", baseVotes: 29 },
  ja: { name: "Японский", nativeName: "日本語 (Japanese)", flag: "🇯🇵", region: "Восточная Азия", baseVotes: 24 },
  it: { name: "Итальянский", nativeName: "Italiano (Italian)", flag: "🇮🇹", region: "Южная Европа", baseVotes: 21 },
  pt: { name: "Португальский", nativeName: "Português (Portuguese)", flag: "🇧🇷", region: "Южная Америка / Европа", baseVotes: 19 },
  uz: { name: "Узбекский", nativeName: "Oʻzbekcha (Uzbek)", flag: "🇺🇿", region: "Центральная Азия", baseVotes: 18 },
  ko: { name: "Корейский", nativeName: "한국어 (Korean)", flag: "🇰🇷", region: "Восточная Азия", baseVotes: 16 },
  pl: { name: "Польский", nativeName: "Polski (Polish)", flag: "🇵🇱", region: "Восточная Европа", baseVotes: 14 },
  hi: { name: "Хинди", nativeName: "हिन्दी (Hindi)", flag: "🇮🇳", region: "Южная Азия", baseVotes: 11 },
  vi: { name: "Вьетнамский", nativeName: "Tiếng Việt (Vietnamese)", flag: "🇻🇳", region: "Юго-Восточная Азия", baseVotes: 8 },
  uk: { name: "Украинский", nativeName: "Українська (Ukrainian)", flag: "🇺🇦", region: "Восточная Европа", baseVotes: 13 },
};

// Хэш голосующего для предотвращения накрутки
function getVoterHash(req: NextRequest, deviceId?: string): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown-ip";
  const userAgent = req.headers.get("user-agent") || "unknown-ua";
  const raw = `${ip}::${userAgent}::${deviceId || ''}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId") || "";
    const voterHash = getVoterHash(req, deviceId);

    // 1. Получаем все реальные голоса из БД
    const res = await pool.query(
      `SELECT language_code, COUNT(*)::int as count FROM language_votes GROUP BY language_code`
    );
    const dbCounts: Record<string, number> = {};
    for (const row of res.rows) {
      dbCounts[row.language_code] = row.count;
    }

    // 2. Проверяем, голосовал ли уже этот пользователь
    let userVotedLang: string | null = null;
    const userRes = await pool.query(
      `SELECT language_code FROM language_votes WHERE voter_hash = $1 LIMIT 1`,
      [voterHash]
    );
    if (userRes.rows.length > 0) {
      userVotedLang = userRes.rows[0].language_code;
    }

    // 3. Формируем итоговый список
    const TARGET_VOTES = 50;
    const languages = Object.entries(DEFAULT_CANDIDATES).map(([code, info]) => {
      const dbVotes = dbCounts[code] || 0;
      const totalVotes = info.baseVotes + dbVotes;
      return {
        code,
        name: info.name,
        nativeName: info.nativeName,
        flag: info.flag,
        region: info.region,
        votes: totalVotes,
        target: TARGET_VOTES,
        progress: Math.min(100, Math.round((totalVotes / TARGET_VOTES) * 100)),
        isReached: totalVotes >= TARGET_VOTES,
      };
    });

    // Сортируем: сначала те, кто ближе всего к цели (больше голосов)
    languages.sort((a, b) => b.votes - a.votes);

    return NextResponse.json({
      success: true,
      target: TARGET_VOTES,
      userVotedLang,
      hasVoted: Boolean(userVotedLang),
      languages,
      // Уже поддерживаемые языки в приложении
      currentLanguages: [
        { code: "ru", name: "Русский", flag: "🇷🇺", active: true },
        { code: "en", name: "English", flag: "🇬🇧", active: true },
        { code: "de", name: "Deutsch", flag: "🇩🇪", active: true },
        { code: "es", name: "Español", flag: "🇪🇸", active: true },
        { code: "fr", name: "Français", flag: "🇫🇷", active: true },
        { code: "ar", name: "العربية", flag: "🇦🇪", active: true },
      ]
    });
  } catch (error: any) {
    console.error("Language vote GET error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { languageCode, languageName, countryFlag, deviceId } = body || {};

    if (!languageCode || typeof languageCode !== "string") {
      return NextResponse.json({ success: false, error: "languageCode is required" }, { status: 400 });
    }

    const voterHash = getVoterHash(req, deviceId);

    // 1. Проверяем, не голосовал ли уже этот пользователь
    const existing = await pool.query(
      `SELECT language_code, language_name FROM language_votes WHERE voter_hash = $1 LIMIT 1`,
      [voterHash]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: false,
        alreadyVoted: true,
        votedLanguage: existing.rows[0].language_code,
        message: "Вы уже проголосовали! С одного устройства можно отдать только один голос."
      }, { status: 409 });
    }

    // 2. Записываем голос
    const finalName = languageName || DEFAULT_CANDIDATES[languageCode]?.name || languageCode;
    const finalFlag = countryFlag || DEFAULT_CANDIDATES[languageCode]?.flag || "🌐";

    await pool.query(
      `INSERT INTO language_votes (language_code, language_name, country_flag, voter_hash) VALUES ($1, $2, $3, $4)`,
      [languageCode, finalName, finalFlag, voterHash]
    );

    // 3. Возвращаем обновленный счетчик для этого языка
    const countRes = await pool.query(
      `SELECT COUNT(*)::int as count FROM language_votes WHERE language_code = $1`,
      [languageCode]
    );
    const dbVotes = countRes.rows[0]?.count || 1;
    const baseVotes = DEFAULT_CANDIDATES[languageCode]?.baseVotes || 0;
    const totalVotes = baseVotes + dbVotes;

    return NextResponse.json({
      success: true,
      languageCode,
      votes: totalVotes,
      target: 50,
      message: `Спасибо за ваш голос за ${finalName}! 🎉`
    });
  } catch (error: any) {
    console.error("Language vote POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to record vote" }, { status: 500 });
  }
}
