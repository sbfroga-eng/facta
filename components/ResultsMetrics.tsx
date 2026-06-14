"use client";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const data = [
  { to: 320, suf: "%", label: "평균 자연 유입 증가" },
  { to: 680, suf: "%", label: "퍼포먼스 광고 ROAS" },
  { to: 5, suf: "x", label: "AI 검색 인용 증가" },
  { to: 98, suf: "%", label: "파트너 재계약률" },
];

export default function ResultsMetrics() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const numRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [play, setPlay] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    data.forEach((d, i) => {
      const el = numRefs.current[i];
      if (el) el.textContent = "0" + d.suf;
    });
    const node = wrapRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !fired.current) {
            fired.current = true;
            setPlay(true);
            data.forEach((d, i) => {
              const dur = 840, delay = 220 + i * 95;
              setTimeout(() => {
                const start = performance.now();
                const tick = (now: number) => {
                  const t = Math.min(1, (now - start) / dur);
                  const eased = 1 - Math.pow(1 - t, 3);
                  const el = numRefs.current[i];
                  if (el) el.textContent = Math.round(eased * d.to) + d.suf;
                  if (t < 1) requestAnimationFrame(tick);
                  else if (el) el.textContent = d.to + d.suf;
                };
                requestAnimationFrame(tick);
              }, delay);
            });
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <section className="block metrics-band" id="results">
      <div className="wrap">
        <Reveal className="sec-head center">
          <span className="eyebrow">Results</span>
          <h2>숫자로 증명하는 성장</h2>
          <p>FACTA와 함께한 브랜드들이 만들어낸 실제 성과 지표입니다.</p>
        </Reveal>
        <div className={`metrics-wrap ${play ? "play" : ""}`} ref={wrapRef}>
          <svg className="metrics-arrow" viewBox="0 0 1000 56" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <path d="M 972 28 L 876 4 L 900 21 L 16 26 L 10 28 L 16 30 L 900 35 L 876 52 Z" fill="#f4530f" />
            <path d="M 12 28 L 950 28" stroke="#ffe0cf" strokeWidth={2.4} strokeLinecap="round" opacity={0.9} />
          </svg>
          <div className="metrics">
            {data.map((d, i) => (
              <div className="metric" key={d.label}>
                <div className="v" ref={(el) => { numRefs.current[i] = el; }}>{d.to + d.suf}</div>
                <div className="l">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
