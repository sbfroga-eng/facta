import { NextResponse } from "next/server";
import { verifySession } from "./session.mjs";
import { canAdmin } from "./pure.mjs";
import { insert } from "./db";

export type AdminRole = "owner" | "editor";
export type AdminSession = { u: string; r: AdminRole; exp: number };

export function readSessionCookie(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)fx_adm=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getAdminSession(req: Request): Promise<AdminSession | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const token = readSessionCookie(req);
  if (!token) return null;
  const payload = await verifySession(token, secret);
  if (!payload || (payload.r !== "owner" && payload.r !== "editor") || typeof payload.u !== "string") return null;
  return payload as AdminSession;
}

/** Origin 이 요청 Host 와 다르면 false(상태를 바꾸는 요청에만 적용). */
export function checkOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const MUTATING = new Set(["POST", "PATCH", "DELETE", "PUT"]);

/** API 라우트 맨 앞에서 호출 — 세션·권한·Origin 을 한 번에 재확인(미들웨어와 이중 체크). */
export async function requireAdmin(
  req: Request,
  action?: string
): Promise<{ session: AdminSession; error: null } | { session: null; error: NextResponse }> {
  const session = await getAdminSession(req);
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  if (action && !canAdmin(session.r, action)) {
    return { session: null, error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  if (MUTATING.has(req.method) && !checkOrigin(req)) {
    return { session: null, error: NextResponse.json({ error: "bad origin" }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function audit(
  actor: string,
  action: string,
  target?: string | null,
  detail: Record<string, unknown> = {},
  ip_hash?: string | null
): Promise<void> {
  try {
    await insert("admin_audit", { actor, action, target: target ?? null, detail, ip_hash: ip_hash ?? null });
  } catch {
    // 감사 로그 실패는 요청 자체를 막지 않는다
  }
}

/** 모든 어드민 응답에 공통 헤더를 덧붙인다. */
export function noStore(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
