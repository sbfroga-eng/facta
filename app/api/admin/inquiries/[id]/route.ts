export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { select, update, insert } from "@/lib/server/db";
import { requireAdmin, audit, noStore } from "@/lib/server/adminGuard";
import { ipHash } from "@/lib/server/ctx";

const STATUSES = ["new", "contacted", "meeting", "won", "lost", "hold"];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin(req, "view_inquiries");
  if (error) return noStore(error);
  const { id } = await params;

  try {
    const rows = await select<unknown[]>("inquiries", `id=eq.${encodeURIComponent(id)}&select=*`);
    const row = Array.isArray(rows) ? rows[0] : undefined;
    if (!row) return noStore(NextResponse.json({ error: "not found" }, { status: 404 }));

    const events = await select<unknown[]>("inquiry_events", `inquiry_id=eq.${encodeURIComponent(id)}&order=ts.asc&select=ts,actor,action,before,after`);

    let diagnosis: unknown = null;
    const diagId = (row as { diagnosis_id?: string | null }).diagnosis_id;
    if (diagId) {
      const diagRows = await select<unknown[]>("diagnoses", `id=eq.${encodeURIComponent(diagId)}&select=id,no,keyword,overall,grade`);
      diagnosis = Array.isArray(diagRows) ? diagRows[0] : null;
    }

    const ip_hash = await ipHash(req);
    await audit(session.u, "view_pii", id, { table: "inquiries" }, ip_hash);

    return noStore(NextResponse.json({ ...(row as object), events: Array.isArray(events) ? events : [], diagnosis }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "inquiry lookup failed" }, { status: 500 }));
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin(req, "edit_inquiries");
  if (error) return noStore(error);
  const { id } = await params;

  let body: { status?: string; assignee?: string; memo?: string };
  try {
    body = await req.json();
  } catch {
    return noStore(NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 }));
  }
  if (body.status != null && !STATUSES.includes(body.status)) {
    return noStore(NextResponse.json({ error: "status 값이 올바르지 않습니다." }, { status: 400 }));
  }

  try {
    const beforeRows = await select<Array<{ status: string; assignee: string | null; memo: string }>>(
      "inquiries", `id=eq.${encodeURIComponent(id)}&select=status,assignee,memo`
    );
    const before = Array.isArray(beforeRows) ? beforeRows[0] : undefined;
    if (!before) return noStore(NextResponse.json({ error: "not found" }, { status: 404 }));

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: session.u };
    const changes: { action: string; before: string; after: string }[] = [];
    if (body.status != null && body.status !== before.status) {
      patch.status = body.status;
      changes.push({ action: "status", before: before.status, after: body.status });
    }
    if (body.assignee != null && body.assignee !== (before.assignee || "")) {
      patch.assignee = body.assignee;
      changes.push({ action: "assignee", before: before.assignee || "", after: body.assignee });
    }
    if (body.memo != null && body.memo !== before.memo) {
      patch.memo = body.memo;
      changes.push({ action: "memo", before: before.memo, after: body.memo });
    }
    if (changes.length === 0) return noStore(NextResponse.json({ ok: true, changed: [] }));

    await update("inquiries", `id=eq.${encodeURIComponent(id)}`, patch);
    await Promise.all(changes.map((c) => insert("inquiry_events", { inquiry_id: id, actor: session.u, action: c.action, before: c.before, after: c.after })));

    const ip_hash = await ipHash(req);
    await audit(session.u, "update", id, { table: "inquiries", fields: changes.map((c) => c.action) }, ip_hash);

    return noStore(NextResponse.json({ ok: true, changed: changes.map((c) => c.action) }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "update failed" }, { status: 500 }));
  }
}
