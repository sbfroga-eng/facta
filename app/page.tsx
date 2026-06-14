import Hero from "@/components/Hero";
import { Trust, Services, Concept, Process, Metrics, Why, Cta } from "@/components/Sections";
import InsightsPreview from "@/components/InsightsPreview";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const faqLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "GEO란 무엇인가요?", acceptedAnswer: { "@type": "Answer", text: "GEO(생성형 엔진 최적화)는 ChatGPT·Gemini·Perplexity 같은 AI 검색이 답변할 때 우리 브랜드를 신뢰할 수 있는 출처로 인용하도록 콘텐츠와 구조화 데이터를 최적화하는 기술입니다." } },
    { "@type": "Question", name: "SEO와 GEO를 함께 해야 하나요?", acceptedAnswer: { "@type": "Answer", text: "네. SEO는 검색 순위를, GEO는 AI 답변 내 인용을 담당해 상호 보완합니다. 기존 SEO 자산은 GEO 점수에도 그대로 활용됩니다." } },
    { "@type": "Question", name: "FACTA는 어떤 서비스를 제공하나요?", acceptedAnswer: { "@type": "Answer", text: "SEO·GEO·LSM(로컬 검색 마케팅)·퍼포먼스 마케팅을 하나의 데이터 전략으로 통합 운영합니다." } },
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
