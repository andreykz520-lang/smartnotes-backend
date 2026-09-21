import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    status: 'ok',
    identity_assertion: 'mock_assertion_' + Date.now().toString(36)
  });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'identity' });
}
