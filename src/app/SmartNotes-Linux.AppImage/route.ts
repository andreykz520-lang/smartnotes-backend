import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(
    "https://github.com/andreykz520-lang/smartnotes-app/releases/download/v1.0.2/SmartNotes.AI-1.0.2.AppImage",
    302
  );
}
