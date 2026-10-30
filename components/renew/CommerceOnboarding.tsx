import FlowReveal from "./FlowReveal";

const PLATFORMS = [
  { name: "네이버 스마트스토어", on: true }, { name: "쿠팡", on: true }, { name: "무신사", on: false },
  { name: "11번가", on: false }, { name: "SSG", on: false }, { name: "지마켓", on: false },
  { name: "카카오 선물하기", on: false }, { name: "알리익스프레스", on: false }, { name: "테무", on: false }, { name: "자사몰", on: false },
];

const STEPS = [
  { h: "입점 진단", p: "플랫폼별 입점 요건과 카테고리 적합도를 점검해 열 채널의 순서를 정합니다.", tag: "AUDIT" },
  { h: "심사 대행", p: "사업자·통신판매업 서류부터 브랜드 권한 증빙까지 준비해 승인까지 끌고 갑니다.", tag: "APPROVAL" },
  { h: "상품 등록", p: "상품명·옵션·속성·키워드 구조를 검색 알고리즘에 맞춰 설계합니다.", tag: "LISTING" },
  { h: "상세 · 콘텐츠", p: "전환되는 상세페이지와 썸네일을 제작하고 리뷰 유입 동선을 만듭니다.", tag: "CONTENT" },
  { h: "광고 · 운영", p: "플랫폼 광고를 세팅하고 매주 데이터를 보며 단가와 노출을 조정합니다.", tag: "OPERATION" },
];

export default function CommerceOnboarding() {
  return (
    <section className="s wm" id="commerce"><div className="w">
      <span className="lab">02 / COMMERCE</span>
      <h2 className="en">COMMERCE ONBOARDING</h2>
      <div className="cmx">
        <div>
          <p className="kr2" style={{ marginTop: 20 }}>상품은 좋은데 어디서 팔아야 할지 모르겠다면.
            펙타는 <b style={{ color: "var(--ink)", fontWeight: 700 }}>입점 심사부터 첫 매출까지</b> 전 과정을 대행합니다.
            플랫폼마다 다른 심사 기준·수수료·노출 알고리즘을 읽고, 브랜드에 맞는 채널부터 순서대로 엽니다.</p>
          <div className="plat">
            {PLATFORMS.map((p) => <span key={p.name} className={p.on ? "on" : ""}>{p.name}</span>)}
          </div>
        </div>
        <div className="cpanel">
          <div className="hd2">ONBOARDING RESULT</div>
          <div className="row"><span className="t">평균 입점 승인 기간</span><span className="v">14<s>일</s></span></div>
          <div className="row"><span className="t">첫 매출 발생까지</span><span className="v">30<s>일</s></span></div>
          <div className="row"><span className="t">동시 운영 가능 채널</span><span className="v">10<s>+</s></span></div>
          <div className="note">심사 기준과 소요 기간은 플랫폼·카테고리·서류 상태에 따라 달라집니다.
            진단 단계에서 브랜드별 예상 일정을 먼저 알려드립니다.</div>
        </div>
      </div>
      <FlowReveal>
        <div className="line"><i /></div>
        <div className="fsteps">
          {STEPS.map((s, i) => (
            <div className="fs" key={s.h}>
              <div className="dot">{String(i + 1).padStart(2, "0")}</div>
              <h4>{s.h}</h4><p>{s.p}</p><span className="tag2">{s.tag}</span>
            </div>
          ))}
        </div>
      </FlowReveal>
    </div></section>
  );
}
