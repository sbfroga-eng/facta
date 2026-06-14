import Diagnosis from "./Diagnosis";
import TypedHeadline from "./TypedHeadline";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">SEO · GEO · LSM · PERFORMANCE</span>
          <TypedHeadline />
          <p className="lead">FACTA는 검색엔진을 넘어 AI 검색·지도·광고까지, 고객이 브랜드를 발견하는 모든 순간을 데이터(Fact)와 타이밍(Timing)으로 연결하는 디지털 마케팅 컴퍼니입니다.</p>
          <div className="hero-cta">
            <a href="#contact" className="btn btn-primary btn-arrow">무료 마케팅 진단</a>
            <a href="#services" className="btn btn-ghost-light">서비스 살펴보기</a>
          </div>
          <div className="hero-meta">
            <div><div className="num">320<em>%</em></div><div className="lbl">평균 유입 증가율</div></div>
            <div><div className="num">4-in-1</div><div className="lbl">통합 검색 채널</div></div>
            <div><div className="num">98<em>%</em></div><div className="lbl">재계약률</div></div>
          </div>
        </div>
        <div className="hero-visual"><Diagnosis /></div>
      </div>
    </section>
  );
}
