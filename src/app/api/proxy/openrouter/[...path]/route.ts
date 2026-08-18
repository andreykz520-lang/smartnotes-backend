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

    const authHeader = req.headers.get("Authorization") || "";
    const apiKey = authHeader.replace("Bearer ", "").trim() || process.env.OPENROUTER_API_KEY || "";

    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key is required" }, { status: 400 });
    }

    const openRouterUrl = `https://openrouter.ai/api/${pathString}`;

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

    const authHeader = req.headers.get("Authorization") || "";
    const apiKey = authHeader.replace("Bearer ", "").trim() || process.env.OPENROUTER_API_KEY || "";

    const openRouterUrl = `https://openrouter.ai/api/${pathString}`;

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
