import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { matchBot } from "@/lib/server/bots.mjs";
import { verifySession } from "@/lib/server/session.mjs";
import { isAdminPath, isAdminLoginPath } from "@/lib/server/pure.mjs";

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon|icon|apple-icon|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|css|js|woff2?)$).*)",
};

function supabaseHeaders(): Record<string, string> | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  const h: Record<string, string> = { "Content-Type": "application/json", apikey: key };
  if (!key.startsWith("sb_secret_")) h.Authorization = `Bearer ${key}`;
  return h;
}

/** 검색·AI 크롤러면 bot_hits 에 기록(응답은 기다리지 않음 — 속도 영향 0). */
async function logBot(req: NextRequest): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const headers = supabaseHeaders();
  if (!url || !headers) return;
  const ua = req.headers.get("user-agent") || "";
  const match = matchBot(ua);
  if (!match) return;
  const country = req.headers.get("x-vercel-ip-country") || null;
  const body = JSON.stringify({
    bot: match.bot,
    kind: match.kind,
    path: req.nextUrl.pathname,
    method: req.method,
    country,
    ua: ua.slice(0, 300),
  });
  try {
    await fetch(`${url}/rest/v1/bot_hits`, { method: "POST", headers, body });
  } catch {
    // 기록 실패는 무시 — 사이트 응답에 영향 없음
  }
}

/** /admin, /api/admin/* 는 로그인 없이는 통과하지 못한다. /admin/login · /api/admin/login 만 예외. */
async function guardAdmin(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;
  if (!isAdminPath(pathname)) return null;
  if (isAdminLoginPath(pathname)) return null;

  const secret = process.env.ADMIN_SESSION_SECRET;
  const cookie = req.cookies.get("fx_adm")?.value;
  const payload = secret && cookie ? await verifySession(cookie, secret) : null;
  if (payload && (payload.r === "owner" || payload.r === "editor")) return null;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export default async function middleware(req: NextRequest, event: NextFetchEvent): Promise<NextResponse> {
  event.waitUntil(logBot(req));

  const guarded = await guardAdmin(req);
  const res = guarded ?? NextResponse.next();

  if (isAdminPath(req.nextUrl.pathname)) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
  }
  return res;
}
