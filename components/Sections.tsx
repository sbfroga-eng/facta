import Reveal from "./Reveal";

export function Trust() {
  const channels: { name: string; slug?: string }[] = [
    { name: "NAVER", slug: "naver" }, { name: "Google", slug: "google" }, { name: "ChatGPT", slug: "openai" },
    { name: "Claude", slug: "claude" }, { name: "Gemini", slug: "gemini" }, { name: "Perplexity", slug: "perplexity" },
    { name: "Meta", slug: "meta" }, { name: "Kakao", slug: "kakao" }, { name: "YouTube", slug: "youtube" },
    { name: "AliExpress", slug: "aliexpress" },
    { name: "쿠팡" }, { name: "무신사" }, { name: "토스" }, { name: "SSG" }, { name: "테무" }, { name: "리멤버" },
  ];
  return (
    <div className="trust"><div className="wrap">
      <span className="t-label">통합 운영 채널</span>
      {channels.map((c) =>
        c.slug ? (
          <img key={c.name} className="t-logo" src={`/logos/${c.slug}.svg`} alt={c.name} title={c.name} />
        ) : (
          <span key={c.name} className="t-item">{c.name}</span>
        )
      )}
    </div></div>
  );
}

const svc = [
  { abbr: "SEO", title: "검색엔진 최적화", desc: "네이버·구글 검색 결과 상위노출로 광고비 없이도 꾸준히 유입되는 자산형 채널을 구축합니다.",
    li: ["키워드 전략 및 검색 의도 분석", "기술적 SEO·페이지 구조 최적화", "콘텐츠 기획 및 백링크 설계"],
    icon: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></> },
  { abbr: "GEO", title: "생성형 엔진 최적화", desc: "ChatGPT·Gemini·Perplexity 같은 AI 검색이 우리 브랜드를 인용하고 추천하도록 만드는 차세대 최적화입니다.",
    li: ["AI 인용 가능성 높은 콘텐츠 구조화", "브랜드 엔티티·신뢰 시그널 강화", "AI 답변 내 노출 모니터링"],
    icon: <><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" /><circle cx="12" cy="12" r="3" /></> },
  { abbr: "LSM", title: "로컬 검색 마케팅", desc: "네이버 플레이스·구글 지도에서 우리 매장이 먼저 발견되도록, 지역 기반 검색 전환을 극대화합니다.",
    li: ["네이버 플레이스·구글 비즈니스 최적화", "리뷰·평점 관리 및 방문 전환 설계", "지역 키워드 상위노출 운영"],
    icon: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></> },
  { abbr: "Performance", title: "퍼포먼스 마케팅", desc: "메타·구글·카카오 광고를 데이터 기반으로 운영해 가장 효율적인 타이밍에 예산을 집행, ROAS를 끌어올립니다.",
    li: ["매체 믹스 설계 및 예산 최적화", "A/B 소재 테스트·전환 추적(GA4·픽셀)", "실시간 대시보드 리포팅"],
    icon: <><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></> },
];

export function Services() {
  return (
    <section className="block" id="services"><div className="wrap">
      <Reveal className="sec-head">
        <span className="eyebrow">Services</span>
        <h2>검색의 패러다임이 바뀐 시대,<br />4개의 축으로 완성하는 통합 마케팅</h2>
        <p>단순 노출이 아니라 발견–신뢰–전환의 전 과정을 설계합니다. 채널별로 흩어진 마케팅을 하나의 데이터 전략으로 통합합니다.</p>
      </Reveal>
      <div className="services-grid">
        {svc.map((s, i) => (
          <Reveal key={s.abbr} delay={(i % 2) * 60}>
            <div className="svc">
              <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{s.icon}</svg></div>
              <span className="abbr">{s.abbr}</span><h3>{s.title}</h3><p>{s.desc}</p>
              <ul>{s.li.map((l) => <li key={l}>{l}</li>)}</ul>
            </div>
          </Reveal>
        ))}
      </div>
    </div></section>
  );
}

export function Concept() {
  return (
    <section className="block" id="concept" style={{ paddingTop: 0 }}><div className="wrap">
      <Reveal>
        <div className="concept"><div className="concept-grid">
          <div>
            <span className="eyebrow" style={{ color: "#ff7a45" }}>Why FACTA</span>
            <h2><em>FACT</em> + <em>TIMING</em>.<br />이름에 전략이 담겨 있습니다.</h2>
            <p>아무리 좋은 메시지도 잘못된 데이터 위에서는 흔들리고, 완벽한 데이터도 타이밍을 놓치면 기회가 사라집니다. FACTA는 검증된 데이터와 정확한 실행 타이밍, 두 가지를 동시에 잡습니다.</p>
          </div>
          <div className="formula">
            <div className="ft"><div className="k">FACT</div><div className="v">데이터</div><div className="d">추측이 아닌 검증된 데이터로 의사결정</div></div>
            <span className="plus">+</span>
            <div className="ft"><div className="k">TIMING</div><div className="v">타이밍</div><div className="d">고객이 움직이는 가장 정확한 순간에 실행</div></div>
          </div>
        </div></div>
      </Reveal>
    </div></section>
  );
}

const steps = [
  ["진단 & 분석", "현재 검색 노출·광고 효율·경쟁사를 데이터로 정밀 진단합니다."],
  ["통합 전략 설계", "SEO·GEO·LSM·퍼포먼스를 하나의 목표로 묶는 로드맵을 만듭니다."],
  ["실행 & 최적화", "채널별로 실행하고 데이터를 보며 매주 빠르게 개선합니다."],
  ["리포팅 & 확장", "투명한 성과 리포트로 검증하고 성공 공식을 확장합니다."],
];
export function Process() {
  return (
    <section className="block process" id="process"><div className="wrap">
      <Reveal className="sec-head center"><span className="eyebrow">Process</span><h2>데이터로 시작해<br />성장으로 끝나는 4단계</h2></Reveal>
      <div className="steps">
        {steps.map(([h, p], i) => (
          <Reveal key={h} delay={(i % 4) * 60}><div className="step"><div className="n" /><h4>{h}</h4><p>{p}</p></div></Reveal>
        ))}
      </div>
    </div></section>
  );
}

const metrics = [["320%", "평균 자연 유입 증가"], ["680%", "퍼포먼스 광고 ROAS"], ["5x", "AI 검색 인용 증가"], ["98%", "파트너 재계약률"]];
export function Metrics() {
  return (
    <section className="block metrics-band" id="results"><div className="wrap">
      <Reveal className="sec-head center"><span className="eyebrow">Results</span><h2>숫자로 증명하는 성장</h2><p>FACTA와 함께한 브랜드들이 만들어낸 실제 성과 지표입니다.</p></Reveal>
      <div className="metrics">
        {metrics.map(([v, l], i) => <Reveal key={l} delay={(i % 4) * 60}><div className="metric"><div className="v">{v}</div><div className="l">{l}</div></div></Reveal>)}
      </div>
    </div></section>
  );
}

const why = [
  { h: "채널이 아닌 성장에 집중", p: "SEO·GEO·LSM·광고를 따로 보지 않고, 하나의 비즈니스 목표로 통합 운영합니다.", icon: <><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" /><path d="m9 12 2 2 4-4" /></> },
  { h: "투명한 데이터 리포팅", p: "감이 아닌 대시보드. 모든 성과를 실시간으로 투명하게 공유합니다.", icon: <><path d="M3 3v18h18" /><rect x="7" y="10" width="3" height="7" /><rect x="14" y="6" width="3" height="11" /></> },
  { h: "AI 검색 시대 선제 대응", p: "전통 SEO를 넘어 생성형 AI 검색(GEO)까지, 변화하는 검색 환경에 가장 먼저 대응합니다.", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
];
export function Why() {
  return (
    <section className="block process"><div className="wrap">
      <Reveal className="sec-head"><span className="eyebrow">Differentiators</span><h2>FACTA가 다른 이유</h2></Reveal>
      <div className="why-grid">
        {why.map((w, i) => (
          <Reveal key={w.h} delay={(i % 3) * 60}><div className="why">
            <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{w.icon}</svg></div>
            <h4>{w.h}</h4><p>{w.p}</p>
          </div></Reveal>
        ))}
      </div>
    </div></section>
  );
}

export function Cta() {
  return (
    <section className="block" style={{ paddingBottom: 0 }}><div className="wrap">
      <Reveal>
        <div className="cta-band">
          <h2>우리 브랜드의 검색 경쟁력,<br />지금 무료로 진단받으세요</h2>
          <p>현재 검색 노출과 광고 효율을 데이터로 분석해 드립니다. 부담 없이 신청하세요.</p>
          <a href="#top" className="btn btn-primary btn-arrow">무료 마케팅 진단 신청</a>
        </div>
      </Reveal>
    </div></section>
  );
}
