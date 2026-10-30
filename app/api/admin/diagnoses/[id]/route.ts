export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { select, update } from "@/lib/server/db";
import { requireAdmin, audit, noStore } from "@/lib/server/adminGuard";
import { ipHash } from "@/lib/server/ctx";

const STATUSES = ["new", "reviewed", "contacted", "converted"];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin(req, "view_diagnoses");
  if (error) return noStore(error);
  const { id } = await params;

  try {
    const rows = await select<unknown[]>("diagnoses", `id=eq.${encodeURIComponent(id)}&select=*`);
    const row = Array.isArray(rows) ? rows[0] : undefined;
    if (!row) return noStore(NextResponse.json({ error: "not found" }, { status: 404 }));

    const linkedInquiries = await select<unknown[]>("inquiries", `diagnosis_id=eq.${encodeURIComponent(id)}&select=id,no,status,created_at`);

    const ip_hash = await ipHash(req);
    await audit(session.u, "view_pii", id, { table: "diagnoses" }, ip_hash);

    return noStore(NextResponse.json({ ...(row as object), linkedInquiries: Array.isArray(linkedInquiries) ? linkedInquiries : [] }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "diagnosis lookup failed" }, { status: 500 }));
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin(req, "edit_diagnoses");
  if (error) return noStore(error);
  const { id } = await params;

  let body: { status?: string; memo?: string };
  try {
    body = await req.json();
  } catch {
    return noStore(NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 }));
  }
  if (body.status != null && !STATUSES.includes(body.status)) {
    return noStore(NextResponse.json({ error: "status 값이 올바르지 않습니다." }, { status: 400 }));
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: session.u };
  if (body.status != null) patch.status = body.status;
  if (body.memo != null) patch.memo = body.memo;
  if (Object.keys(patch).length <= 2) return noStore(NextResponse.json({ ok: true, changed: [] }));

  try {
    await update("diagnoses", `id=eq.${encodeURIComponent(id)}`, patch);
    const ip_hash = await ipHash(req);
    await audit(session.u, "update", id, { table: "diagnoses", fields: Object.keys(patch).filter((k) => k !== "updated_at" && k !== "updated_by") }, ip_hash);
    return noStore(NextResponse.json({ ok: true }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "update failed" }, { status: 500 }));
  }
}
