export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { select, insert } from "@/lib/server/db";
import { requireAdmin, audit, noStore } from "@/lib/server/adminGuard";
import { ipHash } from "@/lib/server/ctx";
import { analyze } from "@/lib/analyze";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin(req, "edit_diagnoses");
  if (error) return noStore(error);
  const { id } = await params;

  try {
    const rows = await select<Array<{ keyword: string; url: string; visitor_id: string | null; session_id: string | null; utm: Record<string, string> }>>(
      "diagnoses", `id=eq.${encodeURIComponent(id)}&select=keyword,url,visitor_id,session_id,utm`
    );
    const row = Array.isArray(rows) ? rows[0] : undefined;
    if (!row) return noStore(NextResponse.json({ error: "not found" }, { status: 404 }));

    const result = analyze(row.keyword, row.url);
    const inserted = await insert<Array<{ id: string }>>("diagnoses", {
      keyword: row.keyword, url: row.url, overall: result.overall, grade: result.grade,
      axes: result.axes, result, visitor_id: row.visitor_id, session_id: row.session_id, utm: row.utm || {},
    });
    const newId = Array.isArray(inserted) ? inserted[0]?.id : undefined;

    const ip_hash = await ipHash(req);
    await audit(session.u, "update", id, { action: "rerun", newId }, ip_hash);

    return noStore(NextResponse.json({ ok: true, id: newId, ...result }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "rerun failed" }, { status: 500 }));
  }
}
