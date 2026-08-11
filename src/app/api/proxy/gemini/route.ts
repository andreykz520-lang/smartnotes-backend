import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
// Максимальное время выполнения (Edge Functions)
export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  try {
    // Читаем тело запроса, которое прислало мобильное приложение
    const body = await req.json();
    
    // Получаем API ключ Gemini из параметров URL
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    // Перенаправляем запрос на оригинальный сервер Google
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;

    const response = await fetch(googleUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Возвращаем ответ от Google обратно в приложение
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Proxy Error" }, { status: 500 });
  }
}
