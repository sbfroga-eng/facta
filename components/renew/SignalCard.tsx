"use client";
import { useEffect, useRef, useState } from "react";

type Signal = { head: string; body: string };

const FALLBACK: Signal[] = [
  { head: "3 SECONDS.", body: "AI 검색이 브랜드를 판단하는 시간, 단 3초." },
  { head: "320% UP.", body: "기술 SEO 개편만으로 만든 자연 유입 증가폭." },
  { head: "5× CITED.", body: "구조화 데이터 설계 후 AI 답변 인용 증가." },
  { head: "98% STAY.", body: "한 번 맡긴 파트너가 다시 맡기는 비율." },
];

export default function SignalCard({ items }: { items?: Signal[] }) {
  const data = items && items.length > 0 ? items : FALLBACK;
  const [i, setI] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let iv = 0;
    let seen = true;
    function run() { if (!iv && seen && !document.hidden) iv = window.setInterval(() => {
      setI((v) => (v + 1) % data.length);
      setAnimKey((k) => k + 1);
    }, 4000); }
    function halt() { clearInterval(iv); iv = 0; }
    const el = ref.current;
    let io: IntersectionObserver | null = null;
    if (el) {
      io = new IntersectionObserver((e) => { seen = e[0].isIntersecting; seen ? run() : halt(); });
      io.observe(el);
    }
    function onVis() { document.hidden ? halt() : run(); }
    document.addEventListener("visibilitychange", onVis);
    run();
    return () => { halt(); io?.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [data.length]);

  const s = data[i];
  return (
    <div className="sig" ref={ref} key={animKey}>
      <div className="tp"><b>0{i + 1} / 0{data.length}</b><span>SIGNAL</span></div>
      <h5>{s.head}</h5>
      <p>{s.body}</p>
      <div className="bar"><i key={animKey} /></div>
    </div>
  );
}
