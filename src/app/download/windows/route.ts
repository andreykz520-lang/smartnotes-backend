import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(
    "https://github.com/andreykz520-lang/smartnotes-backend/releases/download/v1.0.0/SmartNotes-AI-Setup-1.0.0.exe",
    302
  );
}
