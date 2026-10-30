#!/usr/bin/env node
// 현재 코드에 하드코딩된 기본 문구를 content_items 에 "처음 한 번" 넣는다. 이미 그 kind 에 행이 있으면 건너뜀.
// 실행: node --env-file=.env.local scripts/cms-seed.mjs  (npm run cms:seed)
// ※ ③(시안 이식) 이후 기준 — service/metric/why 데이터는 새 홈페이지 시안(ref/펙타_홈페이지시안_v1.0.html) 문구와 동일합니다.

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 없습니다. 건너뜁니다.");
  process.exit(0);
}

function headers() {
  const h = { "Content-Type": "application/json", apikey: KEY };
  if (!KEY.startsWith("sb_secret_")) h.Authorization = `Bearer ${KEY}`;
  return h;
}

async function hasAny(kind) {
  const res = await fetch(`${URL}/rest/v1/content_items?kind=eq.${kind}&select=id&limit=1`, { headers: headers() });
  if (!res.ok) throw new Error(`select ${kind} 실패: ${res.status}`);
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function seed(kind, items) {
  if (await hasAny(kind)) {
    console.log(`- ${kind}: 이미 있음 — 건너뜀`);
    return;
  }
  const rows = items.map((data, i) => ({ kind, sort: i, published: true, data, updated_by: "cms-seed" }));
  const res = await fetch(`${URL}/rest/v1/content_items`, { method: "POST", headers: headers(), body: JSON.stringify(rows) });
  if (!res.ok) throw new Error(`insert ${kind} 실패: ${res.status} ${await res.text()}`);
  console.log(`- ${kind}: ${rows.length}개 추가`);
}

const SERVICE = [
  { code: "SEO", title: "검색엔진 최적화", desc: "네이버·구글 검색 결과 상위노출로 광고비 없이도 꾸준히 유입되는 자산형 채널을 구축합니다.", tag: "TRAFFIC +320%" },
  { code: "GEO", title: "생성형 엔진 최적화", desc: "ChatGPT·Gemini·Perplexity 같은 AI 검색이 우리 브랜드를 인용하고 추천하도록 만듭니다.", tag: "AI CITATION ×5" },
  { code: "AEO", title: "답변 엔진 최적화", desc: "FAQ 구조화와 엔티티 정의로 답변 엔진이 우리 브랜드를 정답으로 제시하게 만듭니다.", tag: "ANSWER SHARE" },
  { code: "LSM", title: "로컬 검색 마케팅", desc: "네이버 플레이스·구글 지도에서 우리 매장이 먼저 발견되도록 지역 검색 전환을 극대화합니다.", tag: "LOCAL RANK #1" },
  { code: "ADS", title: "퍼포먼스 마케팅", desc: "메타·구글·카카오 광고를 데이터 기반으로 운영해 가장 효율적인 타이밍에 예산을 집행합니다.", tag: "ROAS 680%" },
  { code: "VIRAL", title: "바이럴 마케팅", desc: "블로그·커뮤니티·SNS 콘텐츠 확산을 설계해 브랜드 언급량과 자연 유입을 함께 끌어올립니다.", tag: "REACH 120K" },
];

const METRIC = [
  { label: "평균 자연 유입 증가", value: 320, unit: "%", desc: "TRAFFIC" },
  { label: "퍼포먼스 광고 수익률", value: 680, unit: "%", desc: "ROAS" },
  { label: "파트너 재계약률", value: 98, unit: "%", desc: "RETENTION" },
];

const WHY = [
  { no: 1, title: "SEO·GEO·AEO를 모두 다루는 통합 전문 회사", desc: "" },
  { no: 2, title: "네이버·구글·쿠팡 광고 대행 동시 운영", desc: "" },
  { no: 3, title: "AI 검색 시대에 선제 대응하는 GEO 설계 역량", desc: "" },
  { no: 4, title: "감이 아닌 대시보드, 실시간 투명 리포팅", desc: "" },
  { no: 5, title: "파트너 재계약률 98%가 증명하는 신뢰", desc: "" },
];

const FAQ = [
  { q: "FACTA는 어떤 마케팅 회사인가요?", a: "FACTA는 SEO·GEO·AEO·퍼포먼스 마케팅·바이럴 마케팅을 통합하는 온라인 마케팅 전문 회사이자 마케팅 에이전시입니다. 네이버·구글·쿠팡 광고 대행과 커머스 마케팅까지 검색의 모든 접점을 데이터 기반으로 설계합니다." },
  { q: "GEO와 AEO란 무엇인가요?", a: "GEO(생성형 엔진 최적화)와 AEO(답변 엔진 최적화)는 ChatGPT·Gemini·Perplexity 같은 AI 검색이 답변할 때 우리 브랜드를 신뢰할 수 있는 출처로 인용·추천하도록 콘텐츠와 구조화 데이터를 최적화하는 기술입니다. FACTA는 SEO·GEO·AEO 전문 회사로 세 영역을 함께 운영합니다." },
  { q: "네이버·구글·쿠팡 광고 대행도 하나요?", a: "네. 네이버·구글·쿠팡 등 주요 매체의 퍼포먼스 광고 기획·운영·대행을 제공하며, 커머스 마케팅과 매체 믹스 설계로 ROAS를 끌어올립니다." },
  { q: "바이럴 마케팅과 퍼포먼스 마케팅 대행이 가능한가요?", a: "네. 바이럴 마케팅(블로그·커뮤니티·콘텐츠 확산)과 퍼포먼스 마케팅 대행을 함께 운영해 인지도 확산과 전환을 동시에 만듭니다." },
  { q: "SEO와 GEO를 함께 해야 하나요?", a: "네, 병행을 권장합니다. SEO는 검색 순위를, GEO·AEO는 AI 답변 내 인용을 담당해 상호 보완하며, 기존 SEO 자산은 GEO 점수에도 그대로 활용됩니다." },
];

const WORK = [
  { title: "커머스 브랜드 A", client: "", tag: "SEO · COMMERCE", result: "자연 유입 320% 증가" },
  { title: "뷰티 브랜드 B", client: "", tag: "ADS · BEAUTY", result: "ROAS 680% 달성" },
  { title: "테크 기업 C", client: "", tag: "GEO · TECH", result: "AI 인용 5배 증가" },
  { title: "로컬 매장 D", client: "", tag: "LSM · LOCAL", result: "지역 키워드 1위" },
  { title: "식품 브랜드 E", client: "", tag: "VIRAL · FOOD", result: "도달 12만" },
  { title: "패션 브랜드 F", client: "", tag: "SEO · FASHION", result: "검색 점유율 2배" },
  { title: "교육 기업 G", client: "", tag: "AEO · EDU", result: "답변 엔진 노출" },
  { title: "금융 서비스 H", client: "", tag: "ADS · FINANCE", result: "CPA 41% 절감" },
];

const SIGNAL = [
  { head: "3 SECONDS.", body: "AI 검색이 브랜드를 판단하는 시간, 단 3초." },
  { head: "320% UP.", body: "기술 SEO 개편만으로 만든 자연 유입 증가폭." },
  { head: "5× CITED.", body: "구조화 데이터 설계 후 AI 답변 인용 증가." },
  { head: "98% STAY.", body: "한 번 맡긴 파트너가 다시 맡기는 비율." },
];

async function main() {
  console.log("CMS 시드 시작...");
  await seed("service", SERVICE);
  await seed("metric", METRIC);
  await seed("why", WHY);
  await seed("faq", FAQ);
  await seed("work", WORK);
  await seed("signal", SIGNAL);
  console.log("완료.");
}

main().catch((e) => { console.error(e); process.exit(1); });
