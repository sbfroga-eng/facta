import { samplePosts, type Post } from "./content";

// Sanity 헤드리스 CMS 연동 (SDK 없이 HTTP API 직접 호출 — 의존성 최소화)
// 환경변수 NEXT_PUBLIC_SANITY_PROJECT_ID 가 있으면 Sanity 사용, 없으면 로컬 샘플 폴백.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";
export const sanityEnabled = Boolean(projectId);

async function groq<T>(query: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!projectId) return null;
  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", query);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result as T;
  } catch { return null; }
}

const FIELDS = `{
  "slug": slug.current, title, category, excerpt,
  "date": coalesce(publishedAt, _createdAt), "author": coalesce(author->name, "FACTA"), body
}`;

export async function getPosts(): Promise<Post[]> {
  const data = await groq<Post[]>(`*[_type == "post"] | order(publishedAt desc) ${FIELDS}`);
  return data && data.length ? data : samplePosts;
}

export async function getPost(slug: string): Promise<Post | null> {
  const data = await groq<Post[]>(`*[_type == "post" && slug.current == $slug] ${FIELDS}`, { slug });
  if (data && data[0]) return data[0];
  return samplePosts.find((p) => p.slug === slug) || null;
}
