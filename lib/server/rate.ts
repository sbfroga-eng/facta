import { select } from "./db";

/** 같은 ip_hash 로 최근 10분 문의 5건 초과면 true(429 대상). ip_hash 없으면 제한하지 않는다. */
export async function tooManyInquiries(ipHash: string | undefined): Promise<boolean> {
  if (!ipHash) return false;
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const rows = await select<unknown[]>(
    "inquiries",
    `select=id&ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${encodeURIComponent(since)}`
  );
  return Array.isArray(rows) && rows.length >= 5;
}
