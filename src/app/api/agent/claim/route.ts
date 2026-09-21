import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ status: 'ok', claimed: true });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'claim' });
}
