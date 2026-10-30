import { getContent } from "@/lib/cms";

type Faq = { q: string; a: string };

const FALLBACK: Faq[] = [
  { q: "펙타, 믿을 수 있는 업체인가요?", a: "네. <b>(주)펙타</b>는 사업자등록 <b>398-81-04222</b>로 운영되는 법인입니다. 네이버·구글·쿠팡 등 주요 매체의 광고 대행을 수행하고 있습니다." },
  { q: "GEO가 정확히 뭔가요? SEO랑 다른가요?", a: "SEO는 <b>검색 결과 순위</b>를, GEO는 <b>AI 답변 안에서의 인용</b>을 담당합니다. 둘은 경쟁이 아니라 보완 관계예요. 기존 SEO 자산은 GEO 점수에도 그대로 반영됩니다." },
  { q: "어떻게 시작하면 될까요?", a: "먼저 <b>무료 진단</b>부터 받아보세요. 현재 검색 노출과 광고 효율을 데이터로 분석해 드립니다. 영업일 기준 <b>1일 이내</b>에 답변드립니다." },
  { q: "작은 규모인데도 맡길 수 있나요?", a: "프로젝트 규모와 관계없이 환영합니다. 오히려 작게 시작해 <b>데이터로 검증하고 확장</b>하는 방식을 권합니다." },
];

const PARTNERS = ["NAVER", "GOOGLE", "KAKAO", "META", "YOUTUBE", "COUPANG", "CHATGPT", "GEMINI", "PERPLEXITY", "CLAUDE"];

export default async function QnA() {
  const rows = await getContent<Faq>("faq");
  const items = rows?.map((r) => r.data) ?? FALLBACK;
  return (
    <section className="s wm" id="qa"><div className="w">
      <span className="lab">06 / Q&amp;A</span>
      <h2 className="en">FREQUENTLY ASKED</h2>
      <div className="qa">
        {items.slice(0, 4).map((f) => (
          <div className="qr" key={f.q}>
            <div className="qq"><div className="b">{f.q}</div><div className="av">ME</div></div>
            <div className="qn">
              <div className="av">FA</div>
              <div className="bx">
                <div className="nm2">FACTA</div>
                <div className="b" dangerouslySetInnerHTML={{ __html: f.a }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 84 }}>
        <span className="lab" style={{ textAlign: "center" }}>PARTNERS</span>
        <div className="pt">{PARTNERS.map((p) => <span key={p}>{p}</span>)}</div>
      </div>
    </div></section>
  );
}
