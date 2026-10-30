export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { rpc, select } from "@/lib/server/db";
import { requireAdmin, noStore } from "@/lib/server/adminGuard";

export async function GET(req: Request) {
  const { error } = await requireAdmin(req, "view_inquiries");
  if (error) return noStore(error);

  const url = new URL(req.url);
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get("d")) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [bots, recent, pathRows] = await Promise.all([
      rpc<Array<{ bot: string; kind: string; hits: number; last_seen: string }>>("admin_bots", { days }),
      select<unknown[]>("bot_hits", `select=id,ts,bot,kind,path&ts=gte.${encodeURIComponent(since)}&order=ts.desc&limit=100`),
      select<Array<{ path: string; kind: string }>>("bot_hits", `select=path,kind&ts=gte.${encodeURIComponent(since)}`),
    ]);

    const pathCount = new Map<string, { ai: number; search: number }>();
    for (const r of Array.isArray(pathRows) ? pathRows : []) {
      const bucket = pathCount.get(r.path) || { ai: 0, search: 0 };
      if (r.kind === "search") bucket.search += 1; else bucket.ai += 1;
      pathCount.set(r.path, bucket);
    }
    const topPaths = Array.from(pathCount.entries())
      .map(([path, c]) => ({ path, ai: c.ai, search: c.search, total: c.ai + c.search }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);

    return noStore(NextResponse.json({ days, bots, recent: Array.isArray(recent) ? recent : [], topPaths }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "bots failed" }, { status: 500 }));
  }
}
