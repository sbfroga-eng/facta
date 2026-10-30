"use client";
import SignalCard from "./SignalCard";

type Signal = { head: string; body: string };

export default function Hero({ items }: { items?: Signal[] }) {
  return (
    <section className="hero" id="top">
      <div className="vg" /><div className="grid" />
      <SignalCard items={items} />
      <div className="w">
        <h1 className="hh">
          SEARCH <span className="sq" /> GENERATIVE &amp; ANSWER<br />
          <span className="dim">ENGINE OPTIMIZED</span> BY<br />
          <span className="lm">FACT + TIMING</span>
        </h1>
        <p className="hko">
          펙타는 검색엔진을 넘어 AI 검색·지도·광고까지, 고객이 브랜드를 발견하는
          모든 순간을 데이터와 타이밍으로 연결하는 마케팅 전문 회사입니다.
        </p>
        <div className="hcta">
          <button className="pill lime" data-track="hero_diag" onClick={() => window.openDiagnosis?.()}>
            무료 마케팅 진단 →
          </button>
          <a className="pill" data-track="hero_service" href="#service"
            onClick={(e) => { e.preventDefault(); document.querySelector("#service")?.scrollIntoView({ behavior: "smooth" }); }}>
            서비스 살펴보기
          </a>
        </div>
      </div>
      <div className="hwm"><b>FACTA</b></div>
    </section>
  );
}
