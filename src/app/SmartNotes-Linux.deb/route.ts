import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(
    "https://github.com/andreykz520-lang/smartnotes-backend/releases/download/v1.0.0/smartnotesapp_1.0.1_amd64.deb",
    302
  );
}
