import { NextResponse } from 'next/server';

export async function GET() {
  const metadata = {
    resource: "https://smartnotes-ai.ru",
    resource_name: "SmartNotes AI",
    authorization_servers: [
      "https://smartnotes-ai.ru"
    ],
    scopes_supported: [
      "notes:read",
      "notes:write"
    ],
    bearer_methods_supported: [
      "header"
    ],
    resource_documentation: "https://smartnotes-ai.ru/llms.txt"
  };

  return new NextResponse(JSON.stringify(metadata, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
