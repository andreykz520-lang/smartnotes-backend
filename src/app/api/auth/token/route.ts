import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    access_token: 'agent_tok_' + Date.now().toString(36),
    token_type: 'Bearer',
    expires_in: 86400
  });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'token' });
}
