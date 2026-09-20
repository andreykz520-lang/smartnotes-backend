import { NextRequest, NextResponse } from "next/server";
import https from "https";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Агент, игнорирующий ошибки отсутствия российских сертификатов Минцифры
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authKey, model, messages } = body;

    if (!authKey) {
      return NextResponse.json({ error: "GigaChat Auth Key is required" }, { status: 400 });
    }

    // 1. Получаем токен доступа в Сбере
    const rqUid = 'req_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const tokenRes = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': rqUid,
        'Authorization': `Basic ${authKey.trim()}`
      },
      body: 'scope=GIGACHAT_API_PERS',
      // @ts-ignore
      agent: httpsAgent
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return NextResponse.json({ error: `GigaChat Auth Error: ${tokenRes.status} - ${errText}` }, { status: tokenRes.status });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Отправляем сообщение в чат
    const gigaRes = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        model: model || 'GigaChat',
        messages: messages || [{ role: 'user', content: 'Привет' }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
      // @ts-ignore
      agent: httpsAgent
    });

    if (!gigaRes.ok) {
      const errText = await gigaRes.text();
      return NextResponse.json({ error: `GigaChat API Error: ${gigaRes.status} - ${errText}` }, { status: gigaRes.status });
    }

    const gigaData = await gigaRes.json();
    return NextResponse.json(gigaData);

  } catch (error: any) {
    console.error("GigaChat Proxy Error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
