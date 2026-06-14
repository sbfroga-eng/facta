import type { Metadata } from "next";
import { site } from "@/lib/content";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — 데이터와 타이밍으로 성장을 설계하는 마케팅 컴퍼니`, template: `%s · ${site.name}` },
  description: site.description,
  keywords: ["SEO", "GEO", "생성형 엔진 최적화", "AEO", "로컬 검색 마케팅", "퍼포먼스 마케팅", "AI 검색", "디지털 마케팅"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.name, title: `${site.name} — AI 검색 시대의 통합 마케팅`, description: site.description, url: site.url, locale: "ko_KR" },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
  robots: { index: true, follow: true },
};

const orgLd = {
  "@context": "https://schema.org", "@type": "Organization",
  name: site.name, url: site.url, description: site.description,
  email: site.email, telephone: site.phone,
  address: { "@type": "PostalAddress", addressCountry: "KR", addressLocality: "서울", streetAddress: site.address },
  sameAs: ["https://www.instagram.com/", "https://www.youtube.com/"],
};
const siteLd = {
  "@context": "https://schema.org", "@type": "WebSite",
  name: site.name, url: site.url, inLanguage: "ko-KR",
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
