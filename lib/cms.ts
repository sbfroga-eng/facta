// 콘텐츠 관리(어드민 ②) → 홈페이지. DB 꺼짐·빈 결과·에러면 null 을 반환해 호출부가 코드 기본값으로 폴백한다.
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type ContentKind = "work" | "faq" | "metric" | "why" | "signal" | "service" | "notice";

export type ContentItem<T = Record<string, unknown>> = {
  id: string;
  kind: ContentKind;
  sort: number;
  published: boolean;
  data: T;
  version: number;
};

function headers(): Record<string, string> | null {
  if (!KEY) return null;
  const h: Record<string, string> = { apikey: KEY };
  if (!KEY.startsWith("sb_secret_")) h.Authorization = `Bearer ${KEY}`;
  return h;
}

export async function getContent<T = Record<string, unknown>>(kind: ContentKind): Promise<ContentItem<T>[] | null> {
  const h = headers();
  if (!URL || !h) return null;
  try {
    const res = await fetch(
      `${URL}/rest/v1/content_items?kind=eq.${encodeURIComponent(kind)}&published=eq.true&order=sort.asc&select=id,kind,sort,published,data,version`,
      { headers: h, next: { revalidate: 60, tags: ["cms"] } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows as ContentItem<T>[];
  } catch {
    return null;
  }
}
