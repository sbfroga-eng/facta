"use client";
import { useEffect, useRef } from "react";

const MENU = [
  { href: "#service", label: "SERVICE" },
  { href: "#commerce", label: "COMMERCE" },
  { href: "#ref", label: "WORK" },
  { href: "#qa", label: "Q&A" },
  { href: "/insights", label: "INSIGHTS" },
  { href: "#contact", label: "CONTACT" },
];

function ScrambleLink({ href, label }: { href: string; label: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@";

  function onEnter() {
    const el = ref.current;
    if (!el) return;
    if (timer.current) clearInterval(timer.current);
    let f = 0;
    const n = label.length;
    timer.current = setInterval(() => {
      el.textContent = label.split("").map((c, i) => (c === " " ? " " : i < f / 2.4 ? c : CH[(Math.random() * CH.length) | 0])).join("");
      f++;
      if (f > n * 2.4 + 6) {
        if (timer.current) clearInterval(timer.current);
        el.textContent = label;
      }
    }, 28);
  }
  function onLeave() {
    setTimeout(() => {
      if (timer.current) clearInterval(timer.current);
      if (ref.current) ref.current.textContent = label;
    }, 360);
  }

  const isHash = href.startsWith("#");
  return (
    <a ref={ref} href={href} onMouseEnter={onEnter} onMouseLeave={onLeave} data-track={`nav_${label.toLowerCase()}`}
      onClick={isHash ? (e) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      } : undefined}>
      {label}
    </a>
  );
}

export default function NavGlass() {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.querySelector(".renew");
    const nav = document.querySelector(".renew nav");
    const nv = navRef.current;
    if (!root || !nav || !nv) return;

    function lum(c: string): number | null {
      const m = c.match(/[\d.]+/g);
      if (!m || (m.length > 3 && Number(m[3]) < 0.5)) return null;
      return (0.2126 * Number(m[0]) + 0.7152 * Number(m[1]) + 0.0722 * Number(m[2])) / 255;
    }
    function darkAt(x: number, y: number): boolean {
      if (!document.elementsFromPoint) return true;
      const els = document.elementsFromPoint(x, y);
      for (const el0 of els) {
        if (nav!.contains(el0)) continue;
        for (let e: Element | null = el0; e && e !== document.documentElement; e = e.parentElement) {
          if (e.matches(".ho,.wf")) return true;
          const L = lum(getComputedStyle(e).backgroundColor);
          if (L !== null) return L < 0.45;
        }
      }
      return false;
    }
    let pend = 0;
    function f() {
      pend = 0;
      root!.classList.toggle("top", window.scrollY < 24);
      root!.classList.toggle("lt", !darkAt(window.innerWidth / 2, (nav as HTMLElement).offsetHeight / 2));
    }
    function q() {
      if (!pend) pend = requestAnimationFrame(f);
    }
    window.addEventListener("scroll", q, { passive: true });
    window.addEventListener("resize", q, { passive: true });
    f();

    function onRingEnd(e: AnimationEvent) {
      if (e.animationName === "rnRing") nv!.classList.remove("sw");
    }
    nv.addEventListener("animationend", onRingEnd as EventListener);

    /* 노이즈월(매 프레임 바뀌는 캔버스) 위에서는 SVG 굴절 대신 일반 블러 — 굴절 필터가 매 프레임 재계산되는 걸 막는다 */
    const stick = document.querySelector(".renew .sticky");
    const nzIo = stick ? new IntersectionObserver((es) => { root!.classList.toggle("nz", es[0].isIntersecting); },
      { rootMargin: "0px 0px -90% 0px" }) : null;
    if (stick && nzIo) nzIo.observe(stick);

    let loopTimer: ReturnType<typeof setTimeout>;
    function loop() {
      loopTimer = setTimeout(() => {
        if (!document.hidden && !root!.classList.contains("top")) nv!.classList.add("sw");
        loop();
      }, 4000 + Math.random() * 2500);
    }
    loop();

    return () => {
      window.removeEventListener("scroll", q);
      window.removeEventListener("resize", q);
      nv.removeEventListener("animationend", onRingEnd as EventListener);
      clearTimeout(loopTimer);
      nzIo?.disconnect();
    };
  }, []);

  return (
    <nav>
      {/* 유리 굴절 + RGB 색분리 필터 (시안 정본 그대로) */}
      <svg className="flt-defs" aria-hidden="true" focusable="false"><defs>
        <filter id="fx-glass" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.042" numOctaves={2} seed={11} result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.1" result="softNoise" />
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="17" xChannelSelector="R" yChannelSelector="G" result="warp" />
          <feOffset in="warp" dx="2.6" dy="0" result="oR" />
          <feOffset in="warp" dx="-2.6" dy="0" result="oB" />
          <feComponentTransfer in="oR" result="cR"><feFuncG type="linear" slope="0" /><feFuncB type="linear" slope="0" /></feComponentTransfer>
          <feComponentTransfer in="warp" result="cG"><feFuncR type="linear" slope="0" /><feFuncB type="linear" slope="0" /></feComponentTransfer>
          <feComponentTransfer in="oB" result="cB"><feFuncR type="linear" slope="0" /><feFuncG type="linear" slope="0" /></feComponentTransfer>
          <feBlend in="cR" in2="cG" mode="screen" result="rg" />
          <feBlend in="rg" in2="cB" mode="screen" />
        </filter>
      </defs></svg>
      <div className="nv" ref={navRef}>
        <a href="#top" className="lg" aria-label="FACTA" data-track="nav_logo"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/facta-logo-white.png" alt="FACTA" width={127} height={16} />
        </a>
        <div className="menu">
          {MENU.map((m) => <ScrambleLink key={m.href} href={m.href} label={m.label} />)}
        </div>
        <span className="tel">02-499-8508</span>
        <a href="#contact" className="pill lime" data-track="nav_cta"
          onClick={(e) => { e.preventDefault(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}>
          무료 진단 신청
        </a>
      </div>
    </nav>
  );
}
