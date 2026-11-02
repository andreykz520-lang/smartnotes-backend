import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest, { params }: { params?: Promise<{ path?: string[] }> }) {
  try {
    const body = await req.json();
    let pathString = 'v1/chat/completions';
    
    if (params) {
      const resolvedParams = await params;
      if (resolvedParams?.path && resolvedParams.path.length > 0) {
        pathString = resolvedParams.path.join('/');
      }
    }

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
    let apiKey = authHeader.replace(/^Bearer\s*/i, "").trim();
    const fallbackKey = Buffer.from("c2stb3ItdjEtM2Q1NmZjM2ViM2RlNTA2MTQyNTg4NzU1NTA0ZGRjYjkzN2NjZjBiM2Y0NDc2NTkyNThhMTA2OTQ2NTQzOTU0Yg==", "base64").toString("utf-8");
    const OLD_REVOKED_BUILTIN_KEY = Buffer.from("c2stb3ItdjEtOTU1NjRjNzIxNWFlZDkzZjY4NGQ3ZTBiNjRkZjNlNGE0NzE4YzdlODEzNWNlMTA5OTRkNjg1ZGZhNjVkZDQ5Nw==", "base64").toString("utf-8");
    const PREV_INVALID_KEY = Buffer.from("c2stb3ItdjEtZjkxYWJmODI5YzI1ZWM3OTE2MDQ0MDc3ZTc2MzU4MTc2NmNmMmIyMGUwOTc4OGE3NmJjNWI2ZDc5YWM5YTk5MQ==", "base64").toString("utf-8");

    let serverKey = fallbackKey;
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== OLD_REVOKED_BUILTIN_KEY && process.env.OPENROUTER_API_KEY !== PREV_INVALID_KEY) {
      serverKey = process.env.OPENROUTER_API_KEY;
    }

    const isUsingServerKey = !apiKey || apiKey === "null" || apiKey === "undefined" || apiKey.toLowerCase() === "bearer" || apiKey === serverKey || apiKey === OLD_REVOKED_BUILTIN_KEY || apiKey === PREV_INVALID_KEY;

    if (isUsingServerKey) {
      apiKey = serverKey;
    }

    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key is required and must be provided" }, { status: 401 });
    }

    const CHEAPEST_MODEL = 'google/gemini-2.5-flash';
    
    if (body) {
      // Жесткая защита: при использовании встроенного ключа принудительно используется только самая дешевая модель
      if (isUsingServerKey) {
        body.model = CHEAPEST_MODEL;
      } else {
        if (!body.model) {
          body.model = CHEAPEST_MODEL;
        }
        if (body.model.toLowerCase().includes('kimi') || body.model.toLowerCase().includes('moonshot')) {
          return NextResponse.json({ error: "Model Kimi is blocked and not supported" }, { status: 403 });
        }
      }
    }

    const isVercel = process.env.VERCEL === '1';
    let openRouterUrl = isVercel
      ? `https://openrouter.ai/api/${pathString}`
      : `https://smartnotes-backend-two.vercel.app/api/proxy/openrouter/${pathString}`;

    let response: Response;
    try {
      response = await fetch(openRouterUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://smartnotes-ai.ru",
          "X-Title": "SmartNotes AI",
        },
        body: JSON.stringify(body),
      });
    } catch (fetchErr: any) {
      console.error("Vercel tunnel fetch error:", fetchErr);
      return NextResponse.json({
        error: "Vercel Tunnel Error",
        message: fetchErr?.message || String(fetchErr),
        cause: fetchErr?.cause?.message || fetchErr?.cause?.code || String(fetchErr?.cause || "")
      }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error("OpenRouter Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Proxy Error", details: error?.message || String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params?: Promise<{ path?: string[] }> }) {
  try {
    let pathString = 'v1/models';
    if (params) {
      const resolvedParams = await params;
      if (resolvedParams?.path && resolvedParams.path.length > 0) {
        pathString = resolvedParams.path.join('/');
      }
    }

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
    let apiKey = authHeader.replace(/^Bearer\s*/i, "").trim();
    const fallbackKey = Buffer.from("c2stb3ItdjEtM2Q1NmZjM2ViM2RlNTA2MTQyNTg4NzU1NTA0ZGRjYjkzN2NjZjBiM2Y0NDc2NTkyNThhMTA2OTQ2NTQzOTU0Yg==", "base64").toString("utf-8");
    const OLD_REVOKED_BUILTIN_KEY = Buffer.from("c2stb3ItdjEtOTU1NjRjNzIxNWFlZDkzZjY4NGQ3ZTBiNjRkZjNlNGE0NzE4YzdlODEzNWNlMTA5OTRkNjg1ZGZhNjVkZDQ5Nw==", "base64").toString("utf-8");
    const PREV_INVALID_KEY = Buffer.from("c2stb3ItdjEtZjkxYWJmODI5YzI1ZWM3OTE2MDQ0MDc3ZTc2MzU4MTc2NmNmMmIyMGUwOTc4OGE3NmJjNWI2ZDc5YWM5YTk5MQ==", "base64").toString("utf-8");
    if (!apiKey || apiKey === "null" || apiKey === "undefined" || apiKey.toLowerCase() === "bearer" || apiKey === OLD_REVOKED_BUILTIN_KEY || apiKey === PREV_INVALID_KEY) {
      apiKey = fallbackKey;
    }

    const isVercel = process.env.VERCEL === '1';
    const openRouterUrl = isVercel
      ? `https://openrouter.ai/api/${pathString}`
      : `https://smartnotes-backend-two.vercel.app/api/proxy/openrouter/${pathString}`;

    const response = await fetch(openRouterUrl, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://smartnotes-ai.ru",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("OpenRouter Proxy GET Error:", error);
    return NextResponse.json({ error: "Internal Server Proxy Error" }, { status: 500 });
  }
}
