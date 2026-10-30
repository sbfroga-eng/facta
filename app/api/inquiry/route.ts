export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { insert, enabled } from "@/lib/server/db";
import { ipHash, referrerHost } from "@/lib/server/ctx";
import { validateInquiry, isUuid } from "@/lib/server/pure.mjs";
import { tooManyInquiries } from "@/lib/server/rate";

const UNAVAILABLE = { error: "일시적으로 접수가 어렵습니다. 02-499-8508 로 연락 주세요." };

type Body = {
  name?: string; contact?: string; brand?: string; service?: string; message?: string;
  consent?: boolean; website?: string; diagnosisId?: string;
  visitorId?: string; sessionId?: string; path?: string; referrer?: string;
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
};

export async function POST(req: Request) {
  if (!enabled()) return NextResponse.json(UNAVAILABLE, { status: 503 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다.", field: null }, { status: 400 });
  }

  const check = validateInquiry(body);
  if (!check.ok && !check.honeypot) {
    return NextResponse.json({ error: check.error, field: check.field }, { status: 400 });
  }
  if (check.honeypot) {
    // 허니팟 — 성공처럼 보이게 하되 저장하지 않는다.
    return NextResponse.json({ ok: true, no: 0 }, { status: 201 });
  }

  const ip_hash = await ipHash(req);
  if (await tooManyInquiries(ip_hash)) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  const diagId = isUuid(body.diagnosisId) ? body.diagnosisId! : null;   // 형식이 이상하면 버린다(DB 오류로 접수 실패 방지)
  const refHost = referrerHost(body.referrer);
  const utm = body.utm || {};

  let row: { id: string; no: number } | undefined;
  try {
    const inserted = await insert<Array<{ id: string; no: number }>>("inquiries", {
      name: body.name,
      contact: body.contact,
      brand: body.brand || null,
      service: body.service || null,
      message: body.message || null,
      consent: true,
      source: diagId ? "diagnosis" : "contact",
      diagnosis_id: diagId,
      page_path: body.path || null,
      referrer_host: refHost,
      utm,
      visitor_id: body.visitorId || null,
      session_id: body.sessionId || null,
      ip_hash: ip_hash || null,
      user_agent: req.headers.get("user-agent") || null,
    });
    row = Array.isArray(inserted) ? inserted[0] : undefined;
  } catch {
    return NextResponse.json(UNAVAILABLE, { status: 503 });
  }
  if (!row) return NextResponse.json(UNAVAILABLE, { status: 503 });

  try {
    await insert("page_events", {
      ts: new Date().toISOString(),
      visitor_id: body.visitorId || "server",
      session_id: body.sessionId || "server",
      type: "form_submit",
      path: body.path || "/",
      referrer_host: refHost,
      utm_source: utm.source ?? null,
      utm_medium: utm.medium ?? null,
      utm_campaign: utm.campaign ?? null,
      utm_term: utm.term ?? null,
      utm_content: utm.content ?? null,
      ip_hash: ip_hash || null,
      meta: { form: "inquiry", no: row.no },
    });
  } catch {
    // 이벤트 기록 실패는 접수 성공에 영향 없음
  }

  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (resendKey && notifyEmail) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "FACTA 문의 <noreply@facta.kr>",
          to: [notifyEmail],
          subject: `[FACTA] 새 문의 Q-${row.no} — ${body.name}`,
          text: `이름: ${body.name}\n연락처: ${body.contact}\n브랜드: ${body.brand || "-"}\n관심 서비스: ${body.service || "-"}\n내용: ${body.message || "-"}`,
        }),
      });
    } catch {
      // 알림 실패해도 접수는 성공
    }
  }

  return NextResponse.json({ ok: true, no: row.no }, { status: 201 });
}
