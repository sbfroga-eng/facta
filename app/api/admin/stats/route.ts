export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { rpc, select } from "@/lib/server/db";
import { requireAdmin, noStore } from "@/lib/server/adminGuard";
import { maskName, maskContact } from "@/lib/server/pure.mjs";

type DailyRow = { day: string; sessions: number; visitors: number; pageviews: number; diag: number; inq: number; bots: number };

function sumField(rows: DailyRow[], field: keyof DailyRow): number {
  return rows.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
}

export async function GET(req: Request) {
  const { error } = await requireAdmin(req, "view_inquiries");
  if (error) return noStore(error);

  const url = new URL(req.url);
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get("d")) || 30));

  try {
    const all: DailyRow[] = await rpc("admin_daily", { days: days * 2 });
    const current = all.slice(-days);
    const previous = all.slice(0, all.length - current.length);

    const kpi = {
      sessions: sumField(current, "sessions"),
      visitors: sumField(current, "visitors"),
      diag: sumField(current, "diag"),
      inq: sumField(current, "inq"),
      bots: sumField(current, "bots"),
      prevSessions: sumField(previous, "sessions"),
      prevVisitors: sumField(previous, "visitors"),
      prevDiag: sumField(previous, "diag"),
      prevInq: sumField(previous, "inq"),
      prevBots: sumField(previous, "bots"),
    };
    const convRate = kpi.diag > 0 ? Math.round((kpi.inq / kpi.diag) * 1000) / 10 : 0;
    const prevConvRate = kpi.prevDiag > 0 ? Math.round((kpi.prevInq / kpi.prevDiag) * 1000) / 10 : 0;

    const [referrer, topPath, topSection, device, country, funnel, bots] = await Promise.all([
      rpc("admin_top", { dim: "referrer_host", days, lim: 8 }),
      rpc("admin_top", { dim: "path", days, lim: 8 }),
      rpc("admin_top", { dim: "section", days, lim: 8 }),
      rpc("admin_top", { dim: "device", days, lim: 6 }),
      rpc("admin_top", { dim: "country", days, lim: 6 }),
      rpc("admin_funnel", { days }),
      rpc("admin_bots", { days }),
    ]);

    const recentRaw = await select<Array<{ no: number; name: string; contact: string; service: string | null; status: string; created_at: string }>>(
      "inquiries", "select=no,name,contact,service,status,created_at&order=created_at.desc&limit=6"
    );
    const recentInquiries = (Array.isArray(recentRaw) ? recentRaw : []).map((r) => ({
      no: r.no, name: maskName(r.name), contact: maskContact(r.contact), service: r.service, status: r.status, created_at: r.created_at,
    }));

    const since5m = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const liveRows = await select<Array<{ session_id: string }>>("page_events", `select=session_id&ts=gte.${encodeURIComponent(since5m)}`);
    const realtime = new Set((Array.isArray(liveRows) ? liveRows : []).map((r) => r.session_id)).size;

    return noStore(NextResponse.json({
      days, kpi, convRate, prevConvRate,
      daily: current,
      funnel, referrer, topPath, topSection, device, country,
      bots: Array.isArray(bots) ? bots.slice(0, 6) : [],
      recentInquiries, realtime,
    }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "stats failed" }, { status: 500 }));
  }
}
