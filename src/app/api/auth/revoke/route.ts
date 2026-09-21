import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ status: 'revoked' });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'revoke' });
}
