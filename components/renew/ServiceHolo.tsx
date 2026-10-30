import { getContent } from "@/lib/cms";
import HoloCard from "./HoloCard";

type Svc = { code: string; title: string; desc: string; tag: string };

const FALLBACK: Svc[] = [
  { code: "SEO", title: "검색엔진 최적화", desc: "네이버·구글 검색 결과 상위노출로 광고비 없이도 꾸준히 유입되는 자산형 채널을 구축합니다.", tag: "TRAFFIC +320%" },
  { code: "GEO", title: "생성형 엔진 최적화", desc: "ChatGPT·Gemini·Perplexity 같은 AI 검색이 우리 브랜드를 인용하고 추천하도록 만듭니다.", tag: "AI CITATION ×5" },
  { code: "AEO", title: "답변 엔진 최적화", desc: "FAQ 구조화와 엔티티 정의로 답변 엔진이 우리 브랜드를 정답으로 제시하게 만듭니다.", tag: "ANSWER SHARE" },
  { code: "LSM", title: "로컬 검색 마케팅", desc: "네이버 플레이스·구글 지도에서 우리 매장이 먼저 발견되도록 지역 검색 전환을 극대화합니다.", tag: "LOCAL RANK #1" },
  { code: "ADS", title: "퍼포먼스 마케팅", desc: "메타·구글·카카오 광고를 데이터 기반으로 운영해 가장 효율적인 타이밍에 예산을 집행합니다.", tag: "ROAS 680%" },
  { code: "VIRAL", title: "바이럴 마케팅", desc: "블로그·커뮤니티·SNS 콘텐츠 확산을 설계해 브랜드 언급량과 자연 유입을 함께 끌어올립니다.", tag: "REACH 120K" },
];

export default async function ServiceHolo() {
  const rows = await getContent<Svc>("service");
  const items = rows?.map((r) => r.data) ?? FALLBACK;
  return (
    <section className="s" id="service"><div className="w">
      <span className="lab">01 / SERVICE</span>
      <h2 className="en">WHAT WE OPTIMIZE</h2>
      <p className="kr2">단순 노출이 아니라 발견–신뢰–전환의 전 과정을 설계합니다.
        채널별로 흩어진 마케팅을 하나의 데이터 전략으로 통합합니다.</p>
      <div className="hg">
        {items.map((s, i) => <HoloCard key={s.code} no={i + 1} {...s} />)}
      </div>
    </div></section>
  );
}
