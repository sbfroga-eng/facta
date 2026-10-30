export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { select, insert } from "@/lib/server/db";
import { requireAdmin, audit, noStore } from "@/lib/server/adminGuard";
import { ipHash } from "@/lib/server/ctx";

const KINDS = ["work", "faq", "metric", "why", "signal", "service", "notice"];

export async function GET(req: Request) {
  const { error } = await requireAdmin(req, "edit_content");
  if (error) return noStore(error);

  const url = new URL(req.url);
  const kind = (url.searchParams.get("kind") || "").trim();
  if (!kind || !KINDS.includes(kind)) {
    return noStore(NextResponse.json({ error: "kind 가 필요합니다." }, { status: 400 }));
  }

  try {
    const rows = await select<unknown[]>("content_items", `kind=eq.${kind}&select=id,kind,sort,published,data,version,updated_at,updated_by&order=sort.asc`);
    return noStore(NextResponse.json({ kind, rows: Array.isArray(rows) ? rows : [] }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "content list failed" }, { status: 500 }));
  }
}

export async function POST(req: Request) {
  const { session, error } = await requireAdmin(req, "edit_content");
  if (error) return noStore(error);

  let body: { kind?: string; data?: Record<string, unknown>; published?: boolean; sort?: number };
  try {
    body = await req.json();
  } catch {
    return noStore(NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 }));
  }
  if (!body.kind || !KINDS.includes(body.kind) || !body.data || typeof body.data !== "object") {
    return noStore(NextResponse.json({ error: "kind·data 가 필요합니다." }, { status: 400 }));
  }

  try {
    const existing = await select<Array<{ sort: number }>>("content_items", `kind=eq.${body.kind}&select=sort&order=sort.desc&limit=1`);
    const lastSort = Array.isArray(existing) ? existing[0]?.sort ?? -1 : -1;
    const nextSort = typeof body.sort === "number" ? body.sort : lastSort + 1;

    const inserted = await insert<Array<{ id: string }>>("content_items", {
      kind: body.kind, sort: nextSort, published: body.published ?? true, data: body.data, updated_by: session.u,
    });
    const id = Array.isArray(inserted) ? inserted[0]?.id : undefined;

    revalidateTag("cms");
    const ip_hash = await ipHash(req);
    await audit(session.u, "update", id, { table: "content_items", action: "create", kind: body.kind }, ip_hash);

    return noStore(NextResponse.json({ ok: true, id }, { status: 201 }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "content create failed" }, { status: 500 }));
  }
}
