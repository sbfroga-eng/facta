import { site } from "@/lib/content";

export const orgLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  name: site.name,
  legalName: site.legalName,
  alternateName: ["펙타", "(주)펙타", "FACTA", "FACTA 마케팅"],
  url: site.url,
  description: site.description,
  slogan: "데이터와 타이밍으로 성장을 설계하다",
  email: site.email,
  telephone: site.phone,
  address: { "@type": "PostalAddress", addressCountry: "KR", postalCode: "04781", addressRegion: "서울특별시", addressLocality: "성동구", streetAddress: site.streetAddress },
  taxID: site.bizNumber,
  foundingDate: site.foundingDate,
  areaServed: { "@type": "Country", name: "대한민국" },
  knowsAbout: [
    "SEO 검색엔진 최적화", "GEO 생성형 엔진 최적화", "AEO 답변 엔진 최적화",
    "온라인 마케팅", "커머스 마케팅", "퍼포먼스 마케팅", "퍼포먼스 마케팅 대행",
    "바이럴 마케팅", "네이버 광고 대행", "구글 광고 대행", "쿠팡 광고 대행",
    "로컬 검색 마케팅", "AI 검색 마케팅", "마케팅 에이전시",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "FACTA 마케팅 서비스",
    itemListElement: [
      "SEO 검색엔진 최적화",
      "GEO·AEO 생성형·답변 엔진 최적화",
      "퍼포먼스 마케팅 대행",
      "바이럴 마케팅",
      "네이버·구글·쿠팡 광고 대행",
      "로컬 검색 마케팅(LSM)",
      "커머스 마케팅",
    ].map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s, provider: { "@type": "Organization", name: site.name } },
    })),
  },
};

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@id": `${site.url}${it.url}`, name: it.name },
    })),
  };
}
