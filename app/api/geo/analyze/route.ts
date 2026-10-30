import { NextResponse } from "next/server";
import { analyze } from "@/lib/analyze";
import { insert, enabled } from "@/lib/server/db";
import { ipHash } from "@/lib/server/ctx";

// POST /api/geo/analyze  { keyword, url, visitorId?, sessionId?, utm? }
// 현재: 데모 분석 반환 + (DB 켜져 있으면) diagnoses 저장 후 diagId 추가.
// 페이즈2: 여기서 (1) url 크롤링 (2) LLM 채점 (3) 키워드 생성 후 동일 형태로 반환.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const { keyword, url, visitorId, sessionId, utm } = body as {
    keyword?: string; url?: string; visitorId?: string; sessionId?: string; utm?: Record<string, string>;
  };
  if (!keyword || !url) return NextResponse.json({ error: "keyword와 url이 필요합니다." }, { status: 400 });

  const result = analyze(String(keyword), String(url));

  if (!enabled()) return NextResponse.json(result);

  try {
    const ip_hash = await ipHash(req);
    const rows = await insert<Array<{ id: string }>>("diagnoses", {
      keyword: String(keyword).slice(0, 80),
      url: String(url).slice(0, 300),
      overall: result.overall,
      grade: result.grade,
      axes: result.axes,
      result,
      visitor_id: visitorId || null,
      session_id: sessionId || null,
      utm: utm || {},
      ip_hash: ip_hash || null,
    });
    const diagId = Array.isArray(rows) ? rows[0]?.id : undefined;
    return NextResponse.json(diagId ? { ...result, diagId } : result);
  } catch {
    return NextResponse.json(result);
  }
}
