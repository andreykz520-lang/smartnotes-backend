import { NextResponse } from "next/server";

export async function GET() {
  return Response.redirect(
    "https://github.com/andreykz520-lang/smartnotes-app/releases/download/v1.0.3/SmartNotes.AI.Setup.1.0.3.exe",
    302
  );
}
