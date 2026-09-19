import { NextResponse } from 'next/server';

export async function GET() {
  const catalog = {
    linkset: [
      {
        anchor: "https://smartnotes-ai.ru/api",
        "service-doc": [
          {
            href: "https://smartnotes-ai.ru/llms.txt",
            type: "text/markdown"
          }
        ],
        status: [
          {
            href: "https://smartnotes-ai.ru/"
          }
        ]
      }
    ]
  };

  return new NextResponse(JSON.stringify(catalog, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/linkset+json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
