export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { rpc, select, count } from "@/lib/server/db";
import { requireAdmin, noStore } from "@/lib/server/adminGuard";
import { ALLOWED_EVENT_TYPES } from "@/lib/server/pure.mjs";

const PAGE_SIZE = 50;

export async function GET(req: Request) {
  const { error } = await requireAdmin(req, "view_inquiries");
  if (error) return noStore(error);

  const url = new URL(req.url);
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get("d")) || 30));
  const q = (url.searchParams.get("q") || "").trim();
  const type = (url.searchParams.get("type") || "").trim();
  const dev = (url.searchParams.get("dev") || "").trim();
  const page = Math.max(1, Number(url.searchParams.get("p")) || 1);

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const filters: string[] = [`ts=gte.${encodeURIComponent(since)}`];
  if (type) filters.push(`type=eq.${encodeURIComponent(type)}`);
  if (dev) filters.push(`device=eq.${encodeURIComponent(dev)}`);
  let orClause = "";
  if (q) {
    const esc = q.replace(/[,()]/g, "");
    orClause = `&or=(path.ilike.*${encodeURIComponent(esc)}*,referrer_host.ilike.*${encodeURIComponent(esc)}*,utm_campaign.ilike.*${encodeURIComponent(esc)}*)`;
  }
  const base = filters.join("&") + orClause;

  try {
    const offset = (page - 1) * PAGE_SIZE;
    const [rows, total, campaigns] = await Promise.all([
      select<unknown[]>("page_events", `${base}&select=id,ts,session_id,type,path,section,referrer_host,utm_campaign,device,country,city,duration_ms&order=ts.desc&limit=${PAGE_SIZE}&offset=${offset}`),
      count("page_events", base),
      rpc("admin_campaigns", { days }),
    ]);

    const typeSums = await Promise.all(
      Array.from(ALLOWED_EVENT_TYPES).map(async (t) => ({
        type: t,
        count: await count("page_events", `ts=gte.${encodeURIComponent(since)}&type=eq.${t}`),
      }))
    );

    return noStore(NextResponse.json({
      days, page, pageSize: PAGE_SIZE, total,
      rows: Array.isArray(rows) ? rows : [],
      campaigns, typeSums: typeSums.filter((t) => t.count > 0).sort((a, b) => b.count - a.count),
    }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "events failed" }, { status: 500 }));
  }
}
