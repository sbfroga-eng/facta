import type { Metadata } from "next";
import { orgLd } from "@/lib/schema";
import { getContent } from "@/lib/cms";
import "./renew.css";
import RenewRoot from "@/components/renew/RenewRoot";
import Hero from "@/components/renew/Hero";
import StickyWords from "@/components/renew/StickyWords";
import ServiceHolo from "@/components/renew/ServiceHolo";
import CommerceOnboarding from "@/components/renew/CommerceOnboarding";
import Numbers from "@/components/renew/Numbers";
import DiceShowcase from "@/components/renew/DiceShowcase";
import Work from "@/components/renew/Work";
import WhyTop5 from "@/components/renew/WhyTop5";
import WordFlow from "@/components/renew/WordFlow";
import QnA from "@/components/renew/QnA";
import ContactForm from "@/components/renew/ContactForm";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const FAQ_FALLBACK = [
  { q: "FACTA는 어떤 마케팅 회사인가요?", a: "FACTA는 SEO·GEO·AEO·퍼포먼스 마케팅·바이럴 마케팅을 통합하는 온라인 마케팅 전문 회사이자 마케팅 에이전시입니다. 네이버·구글·쿠팡 광고 대행과 커머스 마케팅까지 검색의 모든 접점을 데이터 기반으로 설계합니다." },
  { q: "GEO와 AEO란 무엇인가요?", a: "GEO(생성형 엔진 최적화)와 AEO(답변 엔진 최적화)는 ChatGPT·Gemini·Perplexity 같은 AI 검색이 답변할 때 우리 브랜드를 신뢰할 수 있는 출처로 인용·추천하도록 콘텐츠와 구조화 데이터를 최적화하는 기술입니다. FACTA는 SEO·GEO·AEO 전문 회사로 세 영역을 함께 운영합니다." },
  { q: "네이버·구글·쿠팡 광고 대행도 하나요?", a: "네. 네이버·구글·쿠팡 등 주요 매체의 퍼포먼스 광고 기획·운영·대행을 제공하며, 커머스 마케팅과 매체 믹스 설계로 ROAS를 끌어올립니다." },
  { q: "바이럴 마케팅과 퍼포먼스 마케팅 대행이 가능한가요?", a: "네. 바이럴 마케팅(블로그·커뮤니티·콘텐츠 확산)과 퍼포먼스 마케팅 대행을 함께 운영해 인지도 확산과 전환을 동시에 만듭니다." },
  { q: "SEO와 GEO를 함께 해야 하나요?", a: "네, 병행을 권장합니다. SEO는 검색 순위를, GEO·AEO는 AI 답변 내 인용을 담당해 상호 보완하며, 기존 SEO 자산은 GEO 점수에도 그대로 활용됩니다." },
];

const SIGNAL_FALLBACK = [
  { head: "3 SECONDS.", body: "AI 검색이 브랜드를 판단하는 시간, 단 3초." },
  { head: "320% UP.", body: "기술 SEO 개편만으로 만든 자연 유입 증가폭." },
  { head: "5× CITED.", body: "구조화 데이터 설계 후 AI 답변 인용 증가." },
  { head: "98% STAY.", body: "한 번 맡긴 파트너가 다시 맡기는 비율." },
];

export default async function Home() {
  const [faqRows, signalRows] = await Promise.all([
    getContent<{ q: string; a: string }>("faq"),
    getContent<{ head: string; body: string }>("signal"),
  ]);
  const faqItems = (faqRows?.map((r) => r.data) ?? FAQ_FALLBACK).map((f) => ({ ...f, a: f.a.replace(/<[^>]+>/g, "") }));
  const signalItems = signalRows?.map((r) => r.data) ?? SIGNAL_FALLBACK;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <RenewRoot>
        <Hero items={signalItems} />
        <StickyWords />
        <ServiceHolo />
        <CommerceOnboarding />
        <Numbers />
        <DiceShowcase />
        <Work />
        <WhyTop5 />
        <WordFlow />
        <QnA />
        <ContactForm />
      </RenewRoot>
    </main>
  );
}
