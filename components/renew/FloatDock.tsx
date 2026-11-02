"use client";
import { useEffect, useState } from "react";

/** 회사소개서 — 펙토(FQAUTO) 덱 공유 링크. 바뀌면 이 주소만 고치면 된다. */
const BROCHURE = "https://fqauto.vercel.app/deck/v/d427efc5cffe01bd6fbda502cbbea54fe593fabdfcf6790a40cbb015e057c92e";

/** 오른쪽 끝 플로팅 퀵메뉴: 바로 상담하기 · 회사소개서 다운로드 · 위로가기 */
export default function FloatDock() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let pend = 0;
    const f = () => { pend = 0; setShowTop(window.scrollY > 600); };
    const q = () => { if (!pend) pend = requestAnimationFrame(f); };
    window.addEventListener("scroll", q, { passive: true });
    f();
    return () => window.removeEventListener("scroll", q);
  }, []);

  const track = (label: string) => {
    (window as unknown as { fxTrack?: (t: string, m?: Record<string, unknown>) => void }).fxTrack?.("cta_click", { label });
  };

  return (
    <div className="fdock" aria-label="빠른 메뉴">
      <a href="#contact" className="fd-btn fd-cta" data-track="dock_contact"
        onClick={(e) => { e.preventDefault(); track("dock_contact"); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.8 7L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg>
        <span>바로<br />상담</span>
      </a>
      {(
        <a href={BROCHURE} target="_blank" rel="noopener" className="fd-btn" data-track="dock_brochure"
          aria-label="FACTA 회사소개서 보기(새 창)" onClick={() => track("dock_brochure")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16" /></svg>
          <span>회사<br />소개서</span>
        </a>
      )}
      <button type="button" className={`fd-btn fd-top${showTop ? " on" : ""}`} aria-label="맨 위로" data-track="dock_top"
        onClick={() => { track("dock_top"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m0 0-6 6m6-6 6 6" /></svg>
        <span>TOP</span>
      </button>
    </div>
  );
}
