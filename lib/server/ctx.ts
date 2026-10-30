import { parseUA, isGenericBot, ipHash as pureIpHash } from "./pure.mjs";
import { matchBot } from "./bots.mjs";

export { parseUA, referrerHost } from "./pure.mjs";

export async function ipHash(req: Request): Promise<string | undefined> {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) return undefined;
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
  if (!ip) return undefined;
  return pureIpHash(ip, salt);
}

export function geo(req: Request): { country?: string; city?: string } {
  const country = req.headers.get("x-vercel-ip-country") || undefined;
  const cityRaw = req.headers.get("x-vercel-ip-city") || undefined;
  let city: string | undefined;
  if (cityRaw) {
    try { city = decodeURIComponent(cityRaw); } catch { city = cityRaw; }
  }
  return { country, city };
}

export function uaInfo(req: Request) {
  return parseUA(req.headers.get("user-agent"));
}

/** 수집 저장 여부 판단용 — 이름표 있는 크롤러 또는 일반 봇 패턴이면 true. */
export function isBot(ua: string | null | undefined): boolean {
  return Boolean(matchBot(ua)) || isGenericBot(ua);
}
