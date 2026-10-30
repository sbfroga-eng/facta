export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { select } from "@/lib/server/db";
import { ipHash } from "@/lib/server/ctx";
import { parseAccounts } from "@/lib/server/pure.mjs";
import { verifyPassword } from "@/lib/server/scrypt.mjs";
import { signSession } from "@/lib/server/session.mjs";
import { audit, noStore } from "@/lib/server/adminGuard";
import { insert } from "@/lib/server/db";

const LOCK_WINDOW_MIN = 10;
const LOCK_THRESHOLD = 5;
const SESSION_TTL_SEC = 12 * 60 * 60;

async function recentFailCount(ip_hash: string | undefined): Promise<number> {
  if (!ip_hash) return 0;
  try {
    const since = new Date(Date.now() - LOCK_WINDOW_MIN * 60 * 1000).toISOString();
    const rows = await select<unknown[]>(
      "admin_login_attempts",
      `select=id&ip_hash=eq.${encodeURIComponent(ip_hash)}&ok=eq.false&ts=gte.${encodeURIComponent(since)}`
    );
    return Array.isArray(rows) ? rows.length : 0;
  } catch {
    return 0;
  }
}

async function recordAttempt(ip_hash: string | undefined, username: string, ok: boolean) {
  try {
    await insert("admin_login_attempts", { ip_hash: ip_hash || null, username, ok });
  } catch {
    // 기록 실패해도 로그인 로직은 계속
  }
}

export async function POST(req: Request) {
  let body: { id?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return noStore(NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 }));
  }
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!id || !password) {
    return noStore(NextResponse.json({ error: "아이디와 비밀번호를 입력해 주세요." }, { status: 400 }));
  }

  const accounts = parseAccounts(process.env.ADMIN_ACCOUNTS);
  if (accounts.length === 0) {
    return noStore(NextResponse.json({ error: "관리자 계정이 아직 설정되지 않았습니다." }, { status: 503 }));
  }
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) {
    return noStore(NextResponse.json({ error: "관리자 세션이 아직 설정되지 않았습니다." }, { status: 503 }));
  }

  const ip_hash = await ipHash(req);
  const fails = await recentFailCount(ip_hash);
  if (fails >= LOCK_THRESHOLD) {
    return noStore(NextResponse.json({ error: "로그인 시도가 너무 많습니다. 15분 후 다시 시도해 주세요." }, { status: 423 }));
  }

  const account = accounts.find((a) => a.id === id);
  const ok = account ? verifyPassword(password, account.hash) : false;

  if (!ok) {
    await recordAttempt(ip_hash, id, false);
    await audit(id, "login_fail", null, {}, ip_hash);
    return noStore(NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 }));
  }

  await recordAttempt(ip_hash, id, true);
  await audit(id, "login", null, {}, ip_hash);

  const token = await signSession({ u: id, r: account!.role as "owner" | "editor" }, sessionSecret, SESSION_TTL_SEC);
  const res = NextResponse.json({ ok: true, role: account!.role });
  res.cookies.set("fx_adm", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_TTL_SEC,
  });
  return noStore(res);
}
