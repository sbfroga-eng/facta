import type { Metadata } from "next";
import { site } from "@/lib/content";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "FACTA | SEO·GEO·AEO 마케팅 전문회사 · 퍼포먼스·바이럴 마케팅 대행",
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  category: "마케팅",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "FACTA | SEO·GEO·AEO·퍼포먼스·바이럴 마케팅 전문 회사",
    description: site.description,
    url: site.url,
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const orgLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  name: site.name,
  alternateName: ["팩타", "FACTA 마케팅"],
  url: site.url,
  description: site.description,
  slogan: "데이터와 타이밍으로 성장을 설계하다",
  email: site.email,
  telephone: site.phone,
  address: { "@type": "PostalAddress", addressCountry: "KR", addressLocality: "서울", streetAddress: site.address },
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
  sameAs: ["https://www.instagram.com/", "https://www.youtube.com/"],
};

const siteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  inLanguage: "ko-KR",
  description: site.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      </head>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
