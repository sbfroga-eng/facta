export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { select } from "@/lib/server/db";
import { requireAdmin, noStore } from "@/lib/server/adminGuard";

export async function GET(req: Request, { params }: { params: Promise<{ sid: string }> }) {
  const { error } = await requireAdmin(req, "view_inquiries");
  if (error) return noStore(error);

  const { sid } = await params;
  try {
    const rows = await select<unknown[]>(
      "page_events",
      `select=id,ts,type,path,section,referrer_host,utm_source,utm_campaign,device,browser,os,country,city,duration_ms,meta&session_id=eq.${encodeURIComponent(sid)}&order=ts.asc`
    );
    return noStore(NextResponse.json({ sessionId: sid, events: Array.isArray(rows) ? rows : [] }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "session lookup failed" }, { status: 500 }));
  }
}
