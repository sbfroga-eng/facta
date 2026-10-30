export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { rpc, enabled } from "@/lib/server/db";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!enabled()) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  try {
    const result = await rpc("admin_retention", { events_days: 180, bots_days: 365 });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "retention failed" }, { status: 500 });
  }
}
