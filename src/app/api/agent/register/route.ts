import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    status: 'registered',
    client_id: 'agent_' + Date.now().toString(36),
    token_endpoint: 'https://smartnotes-ai.ru/api/auth/token'
  });
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'smartnotes-ai-agent-registration',
    register_endpoint: 'https://smartnotes-ai.ru/api/agent/register'
  });
}
