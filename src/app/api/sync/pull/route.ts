import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq, gt, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;

    if (!user.isPro) {
      return NextResponse.json(
        { error: "Sync is only available for PRO users" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const lastSyncAt = searchParams.get("lastSyncAt");

    let query = db.select().from(notes).where(eq(notes.userId, user.userId));

    if (lastSyncAt) {
      const date = new Date(lastSyncAt);
      if (!isNaN(date.getTime())) {
        query = db
          .select()
          .from(notes)
          .where(
            and(
              eq(notes.userId, user.userId),
              gt(notes.updatedAt, date)
            )
          );
      }
    }

    const userNotes = await query;

    // Парсим tags обратно в массив
    const formattedNotes = userNotes.map((n) => ({
      ...n,
      tags: n.tags ? JSON.parse(n.tags) : [],
    }));

    return NextResponse.json({ success: true, notes: formattedNotes });
  } catch (error) {
    console.error("Sync pull error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
