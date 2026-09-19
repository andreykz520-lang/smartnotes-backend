import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({
      ok: true,
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      commit: 'check_resend_env'
    });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
