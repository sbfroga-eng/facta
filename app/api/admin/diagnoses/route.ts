export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { select, count } from "@/lib/server/db";
import { requireAdmin, noStore } from "@/lib/server/adminGuard";
import { maskName, maskContact } from "@/lib/server/pure.mjs";

const PAGE_SIZE = 50;
const STATUSES = ["new", "reviewed", "contacted", "converted"];

type Row = { id: string; no: number; created_at: string; keyword: string; url: string; overall: number | null; grade: string | null; name: string | null; contact: string | null; status: string };

export async function GET(req: Request) {
  const { error } = await requireAdmin(req, "view_diagnoses");
  if (error) return noStore(error);

  const url = new URL(req.url);
  const days = Math.min(365, Math.max(0, Number(url.searchParams.get("d")) || 0));
  const st = (url.searchParams.get("st") || "").trim();
  const q = (url.searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(url.searchParams.get("p")) || 1);

  const filters: string[] = [];
  if (days > 0) filters.push(`created_at=gte.${encodeURIComponent(new Date(Date.now() - days * 86400000).toISOString())}`);
  if (st && STATUSES.includes(st)) filters.push(`status=eq.${st}`);
  let orClause = "";
  if (q) {
    const esc = q.replace(/[,()]/g, "");
    orClause = `&or=(keyword.ilike.*${encodeURIComponent(esc)}*,url.ilike.*${encodeURIComponent(esc)}*)`;
  }
  const base = filters.join("&") + orClause;

  try {
    const offset = (page - 1) * PAGE_SIZE;
    const [rows, total, chipRows, kpiRows] = await Promise.all([
      select<Row[]>("diagnoses", `${base}&select=id,no,created_at,keyword,url,overall,grade,name,contact,status&order=created_at.desc&limit=${PAGE_SIZE}&offset=${offset}`),
      count("diagnoses", base),
      select<Array<{ status: string }>>("diagnoses", "select=status"),
      select<Array<{ overall: number | null; contact: string | null; id: string }>>("diagnoses", "select=overall,contact,id"),
    ]);

    const chipCount = new Map<string, number>();
    for (const r of Array.isArray(chipRows) ? chipRows : []) chipCount.set(r.status, (chipCount.get(r.status) || 0) + 1);
    const chips = STATUSES.map((s) => ({ status: s, count: chipCount.get(s) || 0 }));

    const allRows = Array.isArray(kpiRows) ? kpiRows : [];
    const withScore = allRows.filter((r) => typeof r.overall === "number");
    const avgScore = withScore.length ? Math.round(withScore.reduce((a, r) => a + (r.overall || 0), 0) / withScore.length) : 0;
    const withContact = allRows.filter((r) => r.contact).length;
    const contactRate = allRows.length ? Math.round((withContact / allRows.length) * 1000) / 10 : 0;
    const converted = await count("inquiries", "diagnosis_id=not.is.null");

    const masked = (Array.isArray(rows) ? rows : []).map((r) => ({
      ...r, name: r.name ? maskName(r.name) : null, contact: r.contact ? maskContact(r.contact) : null,
    }));

    return noStore(NextResponse.json({
      page, pageSize: PAGE_SIZE, total, chips, rows: masked,
      kpi: { avgScore, contactRate, converted },
    }));
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "diagnoses failed" }, { status: 500 }));
  }
}
