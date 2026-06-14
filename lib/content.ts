// 사이트 공통 데이터 + 인사이트(블로그) 로컬 폴백 콘텐츠
export const site = {
  name: "FACTA",
  tagline: "fact + timing",
  description:
    "FACTA는 SEO·GEO(생성형 엔진 최적화)·LSM(로컬 검색 마케팅)·퍼포먼스 마케팅을 통합 설계하는 디지털 마케팅 컴퍼니입니다. 데이터(Fact)와 타이밍(Timing)으로 검색의 모든 접점에서 성장을 만듭니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://facta.kr",
  email: "hello@facta.kr",
  phone: "02-1234-5678",
  address: "서울특별시 강남구 테헤란로 (예시)",
};

export type Post = {
  slug: string; title: string; category: string; excerpt: string;
  date: string; author: string; body: string[];
};

// Sanity 미연결 시 사용되는 샘플 인사이트 (AEO 모범: FAQ/구조화 콘텐츠)
export const samplePosts: Post[] = [
  {
    slug: "what-is-geo",
    title: "GEO란 무엇인가: AI 검색 시대의 새로운 최적화",
    category: "GEO",
    excerpt: "ChatGPT·Gemini·Perplexity가 브랜드를 인용하게 만드는 생성형 엔진 최적화(GEO)의 개념과 실무 적용법을 정리했습니다.",
    date: "2026-06-10", author: "FACTA",
    body: [
      "GEO(Generative Engine Optimization)는 생성형 AI 검색엔진이 사용자 질문에 답할 때 우리 브랜드를 신뢰할 수 있는 출처로 인용하도록 콘텐츠와 구조화 데이터를 최적화하는 기술입니다.",
      "## 왜 지금 GEO인가",
      "검색 사용자의 상당수가 이미 AI에게 직접 묻고 답을 받습니다. 상위 노출만으로는 충분하지 않으며, AI 답변 안에 인용되어야 발견됩니다.",
      "## 실무 핵심",
      "스키마 마크업, 명확한 엔티티 정의, FAQ형 구조, 권위 시그널이 인용 가능성을 좌우합니다. FACTA는 이 네 가지를 데이터 기반으로 설계합니다.",
    ],
  },
  {
    slug: "seo-geo-together",
    title: "SEO와 GEO를 함께 해야 하는 이유",
    category: "Strategy",
    excerpt: "기존 SEO 자산은 GEO 점수에 그대로 활용됩니다. 두 채널을 함께 운영할 때 노출과 전환 효율이 가장 높아지는 이유.",
    date: "2026-06-05", author: "FACTA",
    body: [
      "SEO는 검색 결과 순위를, GEO는 AI 답변 안에서의 인용을 담당합니다. 둘은 경쟁이 아니라 상호 보완 관계입니다.",
      "## 자산은 재사용된다",
      "이미 구축한 콘텐츠·백링크·스키마는 GEO 점수에도 그대로 반영됩니다. 따라서 SEO를 먼저 다지면 GEO 효율이 올라갑니다.",
    ],
  },
  {
    slug: "local-search-marketing",
    title: "로컬 검색 마케팅(LSM): 지역 매장을 먼저 발견되게 하는 법",
    category: "LSM",
    excerpt: "네이버 플레이스·구글 지도에서 우리 매장이 먼저 노출되도록 만드는 로컬 검색 마케팅 전략.",
    date: "2026-05-28", author: "FACTA",
    body: [
      "LSM(Local Search Marketing)은 지역 기반 검색에서 매장이 먼저 발견되도록 최적화하는 활동입니다.",
      "## 핵심 채널",
      "네이버 플레이스, 구글 비즈니스 프로필 최적화와 리뷰·평점 관리가 방문 전환의 핵심입니다.",
    ],
  },
];
