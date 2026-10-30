export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { select } from "@/lib/server/db";
import { requireAdmin, audit, noStore } from "@/lib/server/adminGuard";
import { ipHash } from "@/lib/server/ctx";

const TABLES = new Set(["inquiries", "diagnoses"]);

export async function POST(req: Request) {
  const { session, error } = await requireAdmin(req, "view_pii");
  if (error) return noStore(error);

  let body: { table?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return noStore(NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 }));
  }
  if (!body.table || !TABLES.has(body.table) || !body.id) {
    return noStore(NextResponse.json({ error: "table·id 가 필요합니다." }, { status: 400 }));
  }

  try {
    const rows = await select<Array<{ name: string | null; contact: string | null }>>(
      body.table, `id=eq.${encodeURIComponent(body.id)}&select=name,contact`
    );
    const row = Array.isArray(rows) ? rows[0] : undefined;
    if (!row) return noStore(NextResponse.json({ error: "not found" }, { status: 404 }));

    const ip_hash = await ipHash(req);
    await audit(session.u, "view_pii", body.id, { table: body.table }, ip_hash);

    return noStore(NextResponse.json({ name: row.name, contact: row.contact }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "pii lookup failed" }, { status: 500 }));
  }
}
