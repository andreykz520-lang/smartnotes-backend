import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ status: 'received' });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'event' });
}
