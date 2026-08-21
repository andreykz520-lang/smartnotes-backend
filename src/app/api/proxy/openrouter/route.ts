import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DEFAULT_KEY_B64 = "c2stb3ItdjEtYjlhMGJmNjRmMWQ2NDBmMjM3YzA1OTk0ZjRiM2U3OGMzMzJmZjlmNDNkZDRkMTQwNjU4OTZmZjJkMTQ1MjlmMA==";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("Authorization") || "";
    let apiKey = authHeader.replace("Bearer ", "").trim();
    if (!apiKey || apiKey === "null" || apiKey === "undefined") {
      apiKey = process.env.OPENROUTER_API_KEY || Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf-8');
    }

    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key is required" }, { status: 400 });
    }

    const openRouterUrl = `https://openrouter.ai/api/v1/chat/completions`;

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
