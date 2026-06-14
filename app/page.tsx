import Hero from "@/components/Hero";
import { Trust, Services, Concept, Process, Metrics, Why, Cta } from "@/components/Sections";
import InsightsPreview from "@/components/InsightsPreview";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "FACTA는 어떤 마케팅 회사인가요?", acceptedAnswer: { "@type": "Answer", text: "FACTA는 SEO·GEO·AEO·퍼포먼스 마케팅·바이럴 마케팅을 통합하는 온라인 마케팅 전문 회사이자 마케팅 에이전시입니다. 네이버·구글·쿠팡 광고 대행과 커머스 마케팅까지 검색의 모든 접점을 데이터 기반으로 설계합니다." } },
    { "@type": "Question", name: "GEO와 AEO란 무엇인가요?", acceptedAnswer: { "@type": "Answer", text: "GEO(생성형 엔진 최적화)와 AEO(답변 엔진 최적화)는 ChatGPT·Gemini·Perplexity 같은 AI 검색이 답변할 때 우리 브랜드를 신뢰할 수 있는 출처로 인용·추천하도록 콘텐츠와 구조화 데이터를 최적화하는 기술입니다. FACTA는 SEO·GEO·AEO 전문 회사로 세 영역을 함께 운영합니다." } },
    { "@type": "Question", name: "네이버·구글·쿠팡 광고 대행도 하나요?", acceptedAnswer: { "@type": "Answer", text: "네. 네이버·구글·쿠팡 등 주요 매체의 퍼포먼스 광고 기획·운영·대행을 제공하며, 커머스 마케팅과 매체 믹스 설계로 ROAS를 끌어올립니다." } },
    { "@type": "Question", name: "바이럴 마케팅과 퍼포먼스 마케팅 대행이 가능한가요?", acceptedAnswer: { "@type": "Answer", text: "네. 바이럴 마케팅(블로그·커뮤니티·콘텐츠 확산)과 퍼포먼스 마케팅 대행을 함께 운영해 인지도 확산과 전환을 동시에 만듭니다." } },
    { "@type": "Question", name: "SEO와 GEO를 함께 해야 하나요?", acceptedAnswer: { "@type": "Answer", text: "네, 병행을 권장합니다. SEO는 검색 순위를, GEO·AEO는 AI 답변 내 인용을 담당해 상호 보완하며, 기존 SEO 자산은 GEO 점수에도 그대로 활용됩니다." } },
  ],
};

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Hero />
      <Trust />
      <Services />
      <Concept />
      <Process />
      <Metrics />
      <Why />
      <InsightsPreview />
      <Cta />
      <Contact />
      <Footer />
    </main>
  );
}
