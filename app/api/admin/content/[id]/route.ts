export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { select, update, insert, remove } from "@/lib/server/db";
import { requireAdmin, audit, noStore } from "@/lib/server/adminGuard";
import { ipHash } from "@/lib/server/ctx";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin(req, "edit_content");
  if (error) return noStore(error);
  const { id } = await params;

  let body: { data?: Record<string, unknown>; published?: boolean; sort?: number };
  try {
    body = await req.json();
  } catch {
    return noStore(NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 }));
  }

  try {
    const rows = await select<Array<{ kind: string; data: Record<string, unknown>; published: boolean; version: number }>>(
      "content_items", `id=eq.${encodeURIComponent(id)}&select=kind,data,published,version`
    );
    const before = Array.isArray(rows) ? rows[0] : undefined;
    if (!before) return noStore(NextResponse.json({ error: "not found" }, { status: 404 }));

    await insert("content_history", {
      item_id: id, kind: before.kind, version: before.version, data: before.data, published: before.published, actor: session.u,
    });

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: session.u, version: before.version + 1 };
    if (body.data != null) patch.data = body.data;
    if (body.published != null) patch.published = body.published;
    if (body.sort != null) patch.sort = body.sort;

    await update("content_items", `id=eq.${encodeURIComponent(id)}`, patch);
    revalidateTag("cms");

    const ip_hash = await ipHash(req);
    await audit(session.u, "update", id, { table: "content_items", kind: before.kind }, ip_hash);

    return noStore(NextResponse.json({ ok: true, version: before.version + 1 }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "content update failed" }, { status: 500 }));
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin(req, "delete");
  if (error) return noStore(error);
  const { id } = await params;

  try {
    await remove("content_items", `id=eq.${encodeURIComponent(id)}`);
    revalidateTag("cms");
    const ip_hash = await ipHash(req);
    await audit(session.u, "delete", id, { table: "content_items" }, ip_hash);
    return noStore(NextResponse.json({ ok: true }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "content delete failed" }, { status: 500 }));
  }
}
