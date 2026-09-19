import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(
    "https://github.com/andreykz520-lang/smartnotes-app/releases/download/v1.0.2/smartnotesapp_1.0.2_amd64.deb",
    302
  );
}
