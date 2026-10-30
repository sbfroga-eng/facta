export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { select } from "@/lib/server/db";
import { requireAdmin, noStore } from "@/lib/server/adminGuard";

export async function GET(req: Request) {
  const { error } = await requireAdmin(req, "audit");
  if (error) return noStore(error);

  try {
    const rows = await select<unknown[]>("admin_audit", "select=id,ts,actor,action,target,detail&order=ts.desc&limit=200");
    return noStore(NextResponse.json({ rows: Array.isArray(rows) ? rows : [] }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "audit failed" }, { status: 500 }));
  }
}
