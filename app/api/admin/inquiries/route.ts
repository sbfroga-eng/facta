export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { select, count } from "@/lib/server/db";
import { requireAdmin, noStore } from "@/lib/server/adminGuard";
import { maskName, maskContact } from "@/lib/server/pure.mjs";

const PAGE_SIZE = 50;
const STATUSES = ["new", "contacted", "meeting", "won", "lost", "hold"];

type Row = { id: string; no: number; created_at: string; name: string; contact: string; brand: string | null; service: string | null; referrer_host: string | null; status: string; assignee: string | null };

export async function GET(req: Request) {
  const { error } = await requireAdmin(req, "view_inquiries");
  if (error) return noStore(error);

  const url = new URL(req.url);
  const days = Math.min(365, Math.max(0, Number(url.searchParams.get("d")) || 0));
  const st = (url.searchParams.get("st") || "").trim();
  const svc = (url.searchParams.get("svc") || "").trim();
  const q = (url.searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(url.searchParams.get("p")) || 1);

  const filters: string[] = [];
  if (days > 0) filters.push(`created_at=gte.${encodeURIComponent(new Date(Date.now() - days * 86400000).toISOString())}`);
  if (st && STATUSES.includes(st)) filters.push(`status=eq.${st}`);
  if (svc) filters.push(`service=eq.${encodeURIComponent(svc)}`);
  let orClause = "";
  if (q) {
    const esc = q.replace(/[,()]/g, "");
    orClause = `&or=(name.ilike.*${encodeURIComponent(esc)}*,contact.ilike.*${encodeURIComponent(esc)}*,brand.ilike.*${encodeURIComponent(esc)}*)`;
  }
  const base = filters.join("&") + orClause;

  try {
    const offset = (page - 1) * PAGE_SIZE;
    const [rows, total, chipRows] = await Promise.all([
      select<Row[]>("inquiries", `${base}&select=id,no,created_at,name,contact,brand,service,referrer_host,status,assignee&order=created_at.desc&limit=${PAGE_SIZE}&offset=${offset}`),
      count("inquiries", base),
      select<Array<{ status: string }>>("inquiries", "select=status"),
    ]);

    const chipCount = new Map<string, number>();
    for (const r of Array.isArray(chipRows) ? chipRows : []) chipCount.set(r.status, (chipCount.get(r.status) || 0) + 1);
    const chips = STATUSES.map((s) => ({ status: s, count: chipCount.get(s) || 0 }));

    const masked = (Array.isArray(rows) ? rows : []).map((r) => ({ ...r, name: maskName(r.name), contact: maskContact(r.contact) }));

    return noStore(NextResponse.json({ page, pageSize: PAGE_SIZE, total, chips, rows: masked }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "inquiries failed" }, { status: 500 }));
  }
}
