export const runtime = "nodejs";

import { insert, enabled } from "@/lib/server/db";
import { ipHash, geo, uaInfo, isBot, referrerHost } from "@/lib/server/ctx";
import { sanitizeEvents } from "@/lib/server/pure.mjs";

const MAX_BODY_BYTES = 8 * 1024;
const EMPTY = new Response(null, { status: 204 });

type Body = {
  visitorId?: string;
  sessionId?: string;
  referrer?: string;
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
  events?: unknown[];
};

export async function POST(req: Request): Promise<Response> {
  let text: string;
  try {
    text = await req.text();
  } catch {
    return EMPTY;
  }
  if (!text || Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) return EMPTY;

  let body: Body;
  try {
    body = JSON.parse(text);
  } catch {
    return EMPTY;
  }

  const ua = req.headers.get("user-agent");
  if (isBot(ua)) return EMPTY;
  if (!enabled()) return EMPTY;

  const visitorId = typeof body.visitorId === "string" ? body.visitorId.slice(0, 80) : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 80) : "";
  if (!visitorId || !sessionId) return EMPTY;

  const events = sanitizeEvents(body.events ?? []);
  if (events.length === 0) return EMPTY;

  const { device, browser, os } = uaInfo(req);
  const { country, city } = geo(req);
  const ip_hash = await ipHash(req);
  const refHost = referrerHost(body.referrer);
  const utm = body.utm || {};
  const ts = new Date().toISOString();

  const rows = events.map((e: { type: string; path: string; section?: string; meta?: Record<string, unknown> }) => ({
    ts,
    visitor_id: visitorId,
    session_id: sessionId,
    type: e.type,
    path: e.path,
    section: e.section ?? null,
    referrer_host: refHost,
    utm_source: utm.source ?? null,
    utm_medium: utm.medium ?? null,
    utm_campaign: utm.campaign ?? null,
    utm_term: utm.term ?? null,
    utm_content: utm.content ?? null,
    device, browser, os,
    country: country ?? null, city: city ?? null,
    duration_ms: typeof (e.meta as { duration_ms?: number } | undefined)?.duration_ms === "number" ? (e.meta as { duration_ms: number }).duration_ms : null,
    meta: e.meta || {},
    ip_hash: ip_hash ?? null,
  }));

  try {
    await insert("page_events", rows);
  } catch {
    // 저장 실패해도 사이트에 영향 없이 조용히 버린다.
  }
  return EMPTY;
}
