"use client";
import { useEffect, useRef, useState } from "react";

const KEYS = ["SEO", "GENERATIVE", "ANSWER", "LOCAL", "PERFORMANCE", "SINCE 2026"];

export default function Intro({ onReady }: { onReady: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [gone, setGone] = useState(false);
  const [num, setNum] = useState(0);
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [plusOn, setPlusOn] = useState(false);
  const [curOn, setCurOn] = useState(true);
  const [curAfterPlus, setCurAfterPlus] = useState(false);
  const [seqOut, setSeqOut] = useState(false);
  const [wmOn, setWmOn] = useState(false);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [keysHtml, setKeysHtml] = useState<{ a: string; b: string; c: string }[]>(
    KEYS.map((k) => ({ a: k, b: "", c: "" }))
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const once = typeof window !== "undefined" && sessionStorage.getItem("fx_intro_seen");
    const force = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("intro") === "1";
    if (once && !force) {
      setMounted(false);
      onReady();
      return;
    }
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setVisible(true);
    try { sessionStorage.setItem("fx_intro_seen", "1"); } catch { /* 저장 불가는 무시 */ }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let abort = false;
    let done = false;
    let live = true;
    let raf = 0;
    const boostRef = { current: 1 };
    const timers: ReturnType<typeof setTimeout>[] = [];
    const st = (fn: () => void, ms: number) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

    function jump() {
      if (done) return;
      done = true; abort = true;
      setNum(100);
      setCurOn(false);
      setSeqOut(true);
      setWmOn(true);
      setJumping(true);
      const b0 = boostRef.current, j0 = performance.now();
      function ramp(t: number) {
        const p = Math.min(1, (t - j0) / 300);
        boostRef.current = b0 + p * p * 18;
        if (p < 1 && live) requestAnimationFrame(ramp);
      }
      requestAnimationFrame(ramp);
      st(() => {
        setFlashOpacity(0.94);
        st(() => setFlashOpacity(0), 70);
      }, 220);
      st(() => {
        onReady();
        setGone(true);
      }, 290);
      st(() => { live = false; cancelAnimationFrame(raf); setVisible(false); }, 760);
    }

    if (reduced) {
      setT1("FACT"); setT2("TIMING"); setPlusOn(true); setCurOn(false);
      setNum(100); setSeqOut(true); setWmOn(true);
      st(jump, 200);
      return () => { timers.forEach(clearTimeout); };
    }

    // ── 캔버스 별 필드 워프 ──
    const cv = canvasRef.current;
    const g = cv?.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let W = 0, H = 0, CX = 0, CY = 0, FOC = 1;
    type Star = { x: number; y: number; z: number; age: number; w: number; al: number };
    const stars: Star[] = [];
    const sparks: { x: number; y: number; px: number; py: number; vx: number; vy: number; l: number; dc: number; w: number; c: string }[] = [];

    function mk(seed: 0 | 1): Star {
      let x = 0, y = 0;
      do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; } while (Math.abs(x) < 0.05 && Math.abs(y) < 0.05);
      return { x: x * 1.15, y: y * 1.15, z: seed ? Math.random() * 0.95 + 0.05 : 1, age: seed ? 1 : 0, w: Math.random() * 1.3 + 0.45, al: Math.random() * 0.55 + 0.45 };
    }
    function size() {
      if (!cv || !g) return;
      const w = window.innerWidth, h = window.innerHeight;
      cv.style.width = w + "px"; cv.style.height = h + "px";
      W = cv.width = Math.round(w * dpr); H = cv.height = Math.round(h * dpr);
      CX = W * 0.5; CY = H * 0.5; FOC = Math.min(W, H) * 0.55;
    }
    function streak(x0: number, y0: number, x1: number, y1: number, w: number, al: number) {
      if (!g) return;
      const dx = x1 - x0, dy = y1 - y0, L = dx * dx + dy * dy;
      if (L < 0.5) return;
      if (L > 576) {
        const gd = g.createLinearGradient(x0, y0, x1, y1);
        gd.addColorStop(0, "rgba(255,255,255,0)"); gd.addColorStop(1, `rgba(255,255,255,${al.toFixed(3)})`);
        g.strokeStyle = gd; g.globalAlpha = 1;
      } else { g.strokeStyle = "#fff"; g.globalAlpha = al; }
      g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    function burst(x: number, y: number, n: number) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.283, sp = (Math.random() * 8 + 1.6) * dpr;
        sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, l: 1, dc: 0.011 + Math.random() * 0.022, w: (Math.random() * 2.1 + 0.5) * dpr, c: Math.random() < 0.5 ? "#FFFFFF" : Math.random() < 0.6 ? "#BDBDBD" : "#E6E6E6" });
      }
    }
    function drawSparks() {
      if (!g) return;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.px = p.x; p.py = p.y; p.x += p.vx; p.y += p.vy;
        p.vx *= 0.955; p.vy = p.vy * 0.955 + 0.14 * dpr; p.l -= p.dc;
        if (p.l <= 0) { sparks.splice(i, 1); continue; }
        g.globalAlpha = p.l; g.strokeStyle = p.c; g.lineWidth = Math.max(0.4, p.w * p.l);
        g.beginPath(); g.moveTo(p.px, p.py); g.lineTo(p.x, p.y); g.stroke();
      }
      g.globalAlpha = 1;
    }
    let lastT = 0;
    function frame(now: number) {
      if (!live || !g) return;
      g.clearRect(0, 0, W, H);
      g.globalCompositeOperation = "lighter"; g.lineCap = "round";
      const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
      const zv = 0.2 * boostRef.current * dt, tail = Math.min(0.5, 0.012 + 0.02 * boostRef.current);
      for (let i = 0; i < stars.length; i++) {
        const sv = stars[i];
        sv.z -= zv; sv.age = Math.min(1, sv.age + dt * 3);
        if (sv.z <= 0.02) { stars[i] = mk(0); continue; }
        const hx = CX + (sv.x / sv.z) * FOC, hy = CY + (sv.y / sv.z) * FOC;
        if (hx < -60 || hx > W + 60 || hy < -60 || hy > H + 60) { stars[i] = mk(0); continue; }
        const zt = Math.min(1, sv.z + tail), tx = CX + (sv.x / zt) * FOC, ty = CY + (sv.y / zt) * FOC;
        const near = 1 - sv.z;
        streak(tx, ty, hx, hy, Math.max(0.4, sv.w * (0.35 + near * 1.5)) * dpr, sv.al * sv.age * Math.pow(near, 1.3));
      }
      g.globalAlpha = 1;
      drawSparks();
      const gr = Math.min(H * 0.32, (110 + boostRef.current * 22) * dpr);
      const cg = g.createRadialGradient(CX, CY, 0, CX, CY, gr);
      cg.addColorStop(0, `rgba(255,255,255,${Math.min(0.1, 0.024 * boostRef.current).toFixed(3)})`);
      cg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = cg; g.beginPath(); g.arc(CX, CY, gr, 0, 6.2832); g.fill();
      g.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    }
    size();
    for (let i = 0; i < 220; i++) stars.push(mk(1));
    raf = requestAnimationFrame(frame);
    const onResize = () => size();
    window.addEventListener("resize", onResize, { passive: true });

    // ── 하단 키워드 스크램블 ──
    const kiv = setInterval(() => {
      setKeysHtml(KEYS.map((k) => {
        const a = Math.floor(Math.random() * k.length), b = a + 1 + Math.floor(Math.random() * 3);
        return { a: k.slice(0, a), b: k.slice(a, b), c: k.slice(b) };
      }));
    }, 70);

    // ── 로딩 카운터 ──
    let lv = 0;
    function tick() {
      if (done || abort) return;
      lv = Math.min(99, lv + 2 + Math.floor(Math.random() * 8));
      setNum(lv);
      boostRef.current = 1.6 + (lv / 100) * 2.4;
      if (lv < 99) st(tick, 40 + Math.random() * 45);
    }

    // ── FACT → + → TIMING → 로고 시퀀스 ──
    function typeText(txt: string, sp: number, setFn: (v: string) => void, cb?: () => void) {
      let i = 0;
      (function step() {
        if (abort) return;
        i++;
        setFn(txt.slice(0, i));
        if (i < txt.length) st(step, sp); else cb?.();
      })();
    }
    function spark(n: number) {
      const r = plusRef.current?.getBoundingClientRect();
      if (!r) return;
      burst((r.left + r.width / 2) * dpr, (r.top + r.height / 2) * dpr, n);
    }
    function runSeq() {
      typeText("FACT", 42, setT1, () => {
        st(() => {
          if (abort) return;
          setPlusOn(true);
          st(() => { if (!abort) { spark(130); st(() => { if (!abort) spark(70); }, 70); } }, 70);
          st(() => {
            if (abort) return;
            setCurAfterPlus(true);
            typeText("TIMING", 38, setT2, () => {
              st(() => {
                if (abort) return;
                setCurOn(false);
                setSeqOut(true);
                setWmOn(true);
                st(() => { if (!abort) jump(); }, 360);
              }, 120);
            });
          }, 190);
        }, 60);
      });
    }

    requestAnimationFrame(() => { tick(); runSeq(); });
    const safety = st(jump, 3000);
    const skipHandler = () => jump();
    const skipBtn = document.getElementById("intro-skip");
    skipBtn?.addEventListener("click", skipHandler);

    return () => {
      live = false; abort = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearInterval(kiv);
      clearTimeout(safety);
      timers.forEach(clearTimeout);
      skipBtn?.removeEventListener("click", skipHandler);
      stars.length = 0; sparks.length = 0;
      if (cv) { cv.width = 0; cv.height = 0; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return null;
  if (!visible) return null;

  return (
    <div className={`intro${jumping ? " jump" : ""}${gone ? " gone" : ""}`} id="intro">
      <canvas id="iwarp" ref={canvasRef} aria-hidden="true" />
      <div className="intro__hud">
        <span className="ild">
          <b>{String(num).padStart(3, "0")}</b>LOADING
          <em className="idots"><i>.</i><i>.</i><i>.</i></em>
          <span className="ibar"><i style={{ transform: `scaleX(${num / 100})` }} /></span>
        </span>
        <button className="skip" id="intro-skip">SKIP</button>
      </div>
      <div className={`seq${seqOut ? " out" : ""}`}>
        <span>{t1}</span>
        {!curAfterPlus && curOn && <i className="cur" />}
        <span className={`pl${plusOn ? " on" : ""}`} ref={plusRef} id="plus">+</span>
        <span>{t2}</span>
        {curAfterPlus && curOn && <i className="cur" />}
      </div>
      <div className={`intro__wm${wmOn ? " on" : ""}`} role="img" aria-label="FACTA"><i aria-hidden="true" /></div>
      <div className="intro__keys">
        {keysHtml.map((k, i) => <span key={KEYS[i]}>{k.a}<em>{k.b}</em>{k.c}</span>)}
      </div>
      <div className="iflash" style={{ opacity: flashOpacity, transition: flashOpacity ? "opacity .06s" : "opacity .32s" }} />
    </div>
  );
}
