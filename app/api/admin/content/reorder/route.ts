export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { update } from "@/lib/server/db";
import { requireAdmin, audit, noStore } from "@/lib/server/adminGuard";
import { ipHash } from "@/lib/server/ctx";

export async function POST(req: Request) {
  const { session, error } = await requireAdmin(req, "edit_content");
  if (error) return noStore(error);

  let body: { kind?: string; order?: string[] };
  try {
    body = await req.json();
  } catch {
    return noStore(NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 }));
  }
  if (!Array.isArray(body.order) || body.order.length === 0) {
    return noStore(NextResponse.json({ error: "order 배열이 필요합니다." }, { status: 400 }));
  }

  try {
    await Promise.all(body.order.map((id, i) => update("content_items", `id=eq.${encodeURIComponent(id)}`, { sort: i, updated_at: new Date().toISOString(), updated_by: session.u })));
    revalidateTag("cms");
    const ip_hash = await ipHash(req);
    await audit(session.u, "update", null, { table: "content_items", action: "reorder", kind: body.kind }, ip_hash);
    return noStore(NextResponse.json({ ok: true }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "reorder failed" }, { status: 500 }));
  }
}
