export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { select } from "@/lib/server/db";
import { requireAdmin, audit, noStore } from "@/lib/server/adminGuard";
import { ipHash } from "@/lib/server/ctx";
import { buildCsv } from "@/lib/server/pure.mjs";

const INQ_STATUSES = ["new", "contacted", "meeting", "won", "lost", "hold"];
const DIAG_STATUSES = ["new", "reviewed", "contacted", "converted"];

function todayStamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  const { session, error } = await requireAdmin(req, "export");
  if (error) return noStore(error);

  const url = new URL(req.url);
  const type = (url.searchParams.get("type") || "").trim();
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const st = (url.searchParams.get("st") || "").trim();

  if (type !== "inquiries" && type !== "diagnoses") {
    return noStore(NextResponse.json({ error: "type 은 inquiries 또는 diagnoses 여야 합니다." }, { status: 400 }));
  }

  const filters: string[] = [];
  if (from) filters.push(`created_at=gte.${encodeURIComponent(new Date(from).toISOString())}`);
  if (to) filters.push(`created_at=lte.${encodeURIComponent(new Date(to).toISOString())}`);
  const base = filters.join("&");

  try {
    let csv: string;
    let rowCount: number;
    let filenameTag: string;
    let filenameAscii: string;

    if (type === "inquiries") {
      if (st && INQ_STATUSES.includes(st)) filters.push(`status=eq.${st}`);
      const query = filters.join("&") + "&select=no,created_at,status,name,contact,brand,service,referrer_host,utm,assignee,memo,message&order=created_at.desc";
      const rows = await select<unknown[]>("inquiries", query);
      const list = Array.isArray(rows) ? rows : [];
      rowCount = list.length;
      filenameTag = "문의";
      filenameAscii = "inquiries";
      csv = buildCsv(
        [
          { label: "접수번호", key: "no" },
          { label: "접수일시", key: "created_at" },
          { label: "상태", key: "status" },
          { label: "이름", key: "name" },
          { label: "연락처", key: "contact" },
          { label: "브랜드", key: "brand" },
          { label: "관심서비스", key: "service" },
          { label: "유입경로", key: "referrer_host" },
          { label: "UTM캠페인", value: (r: { utm?: { campaign?: string } }) => r.utm?.campaign || "" },
          { label: "담당자", key: "assignee" },
          { label: "메모", key: "memo" },
          { label: "문의내용", key: "message" },
        ],
        list
      );
    } else {
      if (st && DIAG_STATUSES.includes(st)) filters.push(`status=eq.${st}`);
      const query = filters.join("&") + "&select=no,created_at,status,keyword,url,overall,grade,name,contact,memo&order=created_at.desc";
      const rows = await select<unknown[]>("diagnoses", query);
      const list = Array.isArray(rows) ? rows : [];
      rowCount = list.length;
      filenameTag = "진단";
      filenameAscii = "diagnoses";
      csv = buildCsv(
        [
          { label: "신청번호", key: "no" },
          { label: "신청일시", key: "created_at" },
          { label: "상태", key: "status" },
          { label: "키워드", key: "keyword" },
          { label: "URL", key: "url" },
          { label: "점수", key: "overall" },
          { label: "등급", key: "grade" },
          { label: "이름", key: "name" },
          { label: "연락처", key: "contact" },
          { label: "메모", key: "memo" },
        ],
        list
      );
    }

    const ip_hash = await ipHash(req);
    await audit(session.u, "export", null, { type, count: rowCount, from, to, st }, ip_hash);

    const utf8Name = `facta_${filenameTag}_${todayStamp()}.csv`;
    const asciiName = `facta_${filenameAscii}_${todayStamp()}.csv`;
    const res = new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(utf8Name)}`,
      },
    });
    return noStore(res);
  } catch (e) {
    return noStore(NextResponse.json({ error: e instanceof Error ? e.message : "export failed" }, { status: 500 }));
  }
}
