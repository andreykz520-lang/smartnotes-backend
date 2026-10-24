import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/SmartNotes-Setup.exe", req.url), 302);
}
