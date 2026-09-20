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
    if (!apiKey || apiKey === "null" || apiKey === "undefined" || apiKey.toLowerCase() === "bearer") {
      apiKey = process.env.OPENROUTER_API_KEY || "";
    }

    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key is required and must be provided" }, { status: 401 });
    }

    // Если используется ключ из .env (ключ разработчика), принудительно ставим самую дешевую модель
    // Это защитит баланс от утечек, так как все бесплатные/триальные юзеры используют этот ключ
    const isUsingDevKey = !authHeader || authHeader === "null" || authHeader === "undefined" || authHeader.toLowerCase() === "bearer";
    
    if (body) {
      if (!body.model || isUsingDevKey) {
        body.model = body.model || 'google/gemini-3.7-flash';
      }
      if (body.model.toLowerCase().includes('kimi') || body.model.toLowerCase().includes('moonshot')) {
        return NextResponse.json({ error: "Model is not supported" }, { status: 403 });
      }
    }

    const openRouterUrl = `https://smartnotes-backend-two.vercel.app/api/proxy/openrouter/${pathString}`;

    const response = await fetch(openRouterUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://smartnotes-ai.ru",
        "X-Title": "SmartNotes AI",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error("OpenRouter Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Proxy Error" }, { status: 500 });
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
    if (!apiKey || apiKey === "null" || apiKey === "undefined" || apiKey.toLowerCase() === "bearer") {
      apiKey = process.env.OPENROUTER_API_KEY || "";
    }

    const openRouterUrl = `https://smartnotes-backend-two.vercel.app/api/proxy/openrouter/${pathString}`;

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
