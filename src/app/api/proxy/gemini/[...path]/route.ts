import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

const OPENROUTER_FALLBACK_KEY = process.env.OPENROUTER_API_KEY || Buffer.from("c2stb3ItdjEtOTU1NjRjNzIxNWFlZDkzZjY4NGQ3ZTBiNjRkZjNlNGE0NzE4YzdlODEzNWNlMTA5OTRkNjg1ZGZhNjVkZDQ5Nw==", "base64").toString("utf-8");

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(req.url);
    let key = searchParams.get("key");
    if (!key || key === "BUILTIN" || key === "SERVER_DEFAULT") {
      key = process.env.GEMINI_API_KEY || "";
    }

    if (!key || key.startsWith("AQ.")) {
      // Mock models list for GET
      return NextResponse.json({
        models: [
          { name: "models/gemini-2.5-flash", displayName: "Gemini 2.5 Flash", supportedGenerationMethods: ["generateContent"] },
          { name: "models/gemini-2.0-flash", displayName: "Gemini 2.0 Flash", supportedGenerationMethods: ["generateContent"] },
          { name: "models/gemini-1.5-flash", displayName: "Gemini 1.5 Flash", supportedGenerationMethods: ["generateContent"] }
        ]
      });
    }

    const pathString = resolvedParams.path ? resolvedParams.path.join('/') : 'v1beta/models';
    const isVercel = process.env.VERCEL === '1';
    const googleUrl = isVercel
      ? `https://generativelanguage.googleapis.com/${pathString}?key=${key}`
      : `https://smartnotes-backend-two.vercel.app/api/proxy/gemini/${pathString}?key=${key}`;

    const response = await fetch(googleUrl);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy GET error:", error);
    return NextResponse.json({ error: "Internal Server Proxy Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const body = await req.json();
    const resolvedParams = await params;
    
    // Получаем API ключ Gemini из параметров URL
    const { searchParams } = new URL(req.url);
    let key = searchParams.get("key");
    const isBuiltin = !key || key === "BUILTIN" || key === "SERVER_DEFAULT";

    // Если встроенный ключ (PRO+) или ключ не валиден для Google, используем надежный OpenRouter Flash
    if (isBuiltin || !key || key.startsWith("AQ.")) {
      try {
        const contents = body?.contents || [];
        const messages: any[] = [];
        for (const item of contents) {
          const role = item.role === "model" || item.role === "assistant" ? "assistant" : "user";
          const textParts: string[] = [];
          const audioParts: any[] = [];
          if (Array.isArray(item.parts)) {
            for (const p of item.parts) {
              if (p.text) textParts.push(p.text);
              if (p.inlineData && p.inlineData.data) {
                audioParts.push({
                  type: "image_url",
                  image_url: { url: `data:${p.inlineData.mimeType || 'audio/webm'};base64,${p.inlineData.data}` }
                });
              }
            }
          }
          const contentItems: any[] = [];
          if (textParts.length > 0) contentItems.push({ type: "text", text: textParts.join("\n") });
          contentItems.push(...audioParts);
          
          messages.push({
            role,
            content: contentItems.length === 1 && contentItems[0].type === "text" ? contentItems[0].text : contentItems
          });
        }

        if (messages.length === 0) {
          messages.push({ role: "user", content: "Привет" });
        }

        const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_FALLBACK_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://smartnotes-ai.ru",
            "X-Title": "SmartNotes AI",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages,
            temperature: 0.2,
          })
        });

        if (openRouterRes.ok) {
          const orData = await openRouterRes.json();
          const responseText = orData.choices?.[0]?.message?.content || "";
          return NextResponse.json({
            candidates: [{
              content: {
                parts: [{ text: responseText }],
                role: "model"
              },
              finishReason: "STOP",
              index: 0
            }]
          });
        }
      } catch (orErr) {
        console.warn("OpenRouter fallback error in Gemini proxy:", orErr);
      }

      key = process.env.GEMINI_API_KEY || "";
    }

    if (!key) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    let pathString = resolvedParams.path ? resolvedParams.path.join('/') : 'v1beta/models';
    const serverGeminiModel = process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.5-flash';
    if (pathString.includes(':generateContent')) {
       pathString = pathString.replace(/models\/[^:]+:generateContent/, `models/${serverGeminiModel}:generateContent`);
    }
    
    // Перенаправляем запрос через зарубежный Vercel шлюз к Google
    const isVercel = process.env.VERCEL === '1';
    const googleUrl = isVercel
      ? `https://generativelanguage.googleapis.com/${pathString}?key=${key}`
      : `https://smartnotes-backend-two.vercel.app/api/proxy/gemini/${pathString}?key=${key}`;

    const response = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy POST error:", error);
    return NextResponse.json({ error: "Internal Server Proxy Error" }, { status: 500 });
  }
}
