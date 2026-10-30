import type { Metadata } from "next";
import { site } from "@/lib/content";
import Script from "next/script";
import { spaceGrotesk } from "@/lib/fonts";
import "./globals.css";

const GTM_ID = "GTM-WJWMHT74";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "펙타(FACTA) | SEO·GEO·AEO 마케팅 전문회사",
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  category: "마케팅",
  verification: { other: { "naver-site-verification": "ccedb32e03185c9aba9ee8b2dcb24e0323f21e87" } },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "펙타(FACTA) | 온라인·퍼포먼스·AI 마케팅 회사",
    description: site.description,
    url: site.url,
    locale: "ko_KR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "FACTA — SEO·GEO·AEO·퍼포먼스·바이럴 마케팅" }],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description, images: ["/og.png"] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
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
    <html lang="ko" className={spaceGrotesk.variable}>
      <head>
        {/* Pretendard 공식 dynamic subset — 페이지에 실제 쓰인 글자 묶음만 받는다(preload 없음) */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/fonts/pretendard/pretendardvariable-dynamic-subset.css" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
        <Script id="gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');` }} />
      </head>
      <body>
        <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript>
        {children}
      </body>
    </html>
  );
}
