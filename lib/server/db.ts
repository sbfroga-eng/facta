// Supabase PostgREST 직접 호출 — SDK 미사용(의존성 0). 이 파일은 서버에서만 import 한다(클라이언트 금지).
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function enabled(): boolean {
  return Boolean(URL && KEY);
}

function headers(extra?: Record<string, string>): Record<string, string> {
  if (!KEY) return { ...extra };
  const h: Record<string, string> = { apikey: KEY, ...extra };
  // 새 형식(sb_secret_...)은 apikey 만, 예전 형식(eyJ... JWT)은 Authorization도 필요.
  if (!KEY.startsWith("sb_secret_")) h.Authorization = `Bearer ${KEY}`;
  return h;
}

async function sb(path: string, init?: RequestInit): Promise<Response> {
  if (!URL || !KEY) throw new Error("DB not configured");
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...headers(init?.headers as Record<string, string>) },
  });
  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch { /* ignore */ }
    throw new Error(`DB error ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res;
}

export async function insert<T = unknown>(table: string, row: Record<string, unknown> | Record<string, unknown>[]): Promise<T> {
  const res = await sb(table, {
    method: "POST",
    body: JSON.stringify(row),
    headers: { Prefer: "return=representation" },
  });
  return (await res.json()) as T;
}

export async function select<T = unknown>(table: string, query: string = ""): Promise<T> {
  const qs = query.startsWith("?") || query === "" ? query : `?${query}`;
  const res = await sb(`${table}${qs}`, { method: "GET" });
  return (await res.json()) as T;
}

export async function rpc<T = unknown>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await sb(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) });
  return (await res.json()) as T;
}

export async function update<T = unknown>(table: string, match: string, patch: Record<string, unknown>): Promise<T> {
  const qs = match.startsWith("?") || match === "" ? match : `?${match}`;
  const res = await sb(`${table}${qs}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    headers: { Prefer: "return=representation" },
  });
  return (await res.json()) as T;
}

export async function remove<T = unknown>(table: string, match: string): Promise<T> {
  const qs = match.startsWith("?") || match === "" ? match : `?${match}`;
  const res = await sb(`${table}${qs}`, { method: "DELETE", headers: { Prefer: "return=representation" } });
  return (await res.json()) as T;
}

/** select=id 로만 가져오되 Content-Range 헤더에서 총 개수만 뽑아낸다(목록 전체를 내려받지 않음). */
export async function count(table: string, query: string = ""): Promise<number> {
  if (!URL || !KEY) throw new Error("DB not configured");
  const sep = query ? "&" : "";
  const qs = query.startsWith("?") ? query.slice(1) : query;
  const res = await fetch(`${URL}/rest/v1/${table}?${qs}${sep}select=id&limit=1`, {
    headers: { ...headers(), Prefer: "count=exact" },
  });
  if (!res.ok) throw new Error(`DB error ${res.status}`);
  const range = res.headers.get("content-range") || "";
  const total = range.split("/")[1];
  return total && total !== "*" ? Number(total) : 0;
}
