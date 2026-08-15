import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const pathString = resolvedParams.path ? resolvedParams.path.join('/') : 'v1beta/models';
    const googleUrl = `https://generativelanguage.googleapis.com/${pathString}?key=${key}`;

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
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    // Собираем оригинальный путь, который запрашивало приложение
    const pathString = resolvedParams.path ? resolvedParams.path.join('/') : 'v1beta/models';

    // Перенаправляем запрос на оригинальный сервер Google
    const googleUrl = `https://generativelanguage.googleapis.com/${pathString}?key=${key}`;

    const response = await fetch(googleUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error("Proxy POST error:", error);
    return NextResponse.json({ error: "Internal Server Proxy Error" }, { status: 500 });
  }
}
