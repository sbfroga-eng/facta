"use client";
import { useEffect, useRef } from "react";

type Face = [string, number, [number, number, number], number];
const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const SZ = 360, H2 = SZ / 2;
const F: Face[] = [
  [`translateZ(${H2}px)`, 1, [0, 0, 1], 135],
  [`rotateY(180deg) translateZ(${H2}px)`, 6, [0, 0, -1], 45],
  [`rotateY(90deg) translateZ(${H2}px)`, 3, [1, 0, 0], 200],
  [`rotateY(-90deg) translateZ(${H2}px)`, 4, [-1, 0, 0], 290],
  [`rotateX(90deg) translateZ(${H2}px)`, 2, [0, -1, 0], 10],
  [`rotateX(-90deg) translateZ(${H2}px)`, 5, [0, 1, 0], 250],
];

export default function FollowDie() {
  const elRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = document.querySelector<HTMLElement>(".hero");
    const endEl = document.getElementById("commerce");
    const stick = document.querySelector<HTMLElement>(".sticky");
    const el = elRef.current, cube = cubeRef.current;
    if (!hero || !el || !cube) return;
    const faces = Array.from(cube.querySelectorAll<HTMLElement>(".fd__f"));
    const L0 = [-0.45, -0.55, 1];
    const ll = Math.hypot(L0[0], L0[1], L0[2]);
    const L = L0.map((v) => v / ll);

    let W = window.innerWidth, Hh = window.innerHeight, goal = window.scrollY, cur = window.scrollY;
    let raf = 0, t0 = 0;
    const THROW = 1200;
    let front = false, fading = false;
    const PI = Math.PI;
    const cl = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

    function frame(now?: number) {
      now = now || performance.now();
      cur += (goal - cur) * 0.085;
      let busy = Math.abs(goal - cur) > 0.5;
      const A = hero!.offsetTop + hero!.offsetHeight * 0.5;
      const B = (endEl ? endEl.offsetTop : document.documentElement.scrollHeight) - Hh;
      const p = cl((cur - A) / Math.max(1, B - A));
      if (!t0 && goal > A) t0 = now;
      if (t0 && goal < A - Hh * 0.3) t0 = 0;
      const mob = W < 768;
      const k = 0.5 + 0.5 * Math.cos(p * PI * 7 + 2.09);
      let size = (mob ? 0.08 + 0.05 * k : 0.1 + 0.08 * k) * Hh;
      let x = Math.sin(p * PI * 3.5 + 1.06) * (W / 2) * (mob ? 0.42 : 0.6);
      let y = (mob ? 0.2 : 0.06) * Hh - Math.sin(p * PI * 9) * Hh * 0.05;
      const rx = p * PI * 9 + 0.4, ry = p * PI * 12 + 0.6, rz = Math.sin(p * PI * 3) * 0.3;
      let roll = 0;
      const tt = t0 ? cl((now - t0) / THROW) : 0;
      if (t0 && tt < 1) {
        busy = true;
        const e = 1 - Math.pow(1 - tt, 3), bo = Math.abs(Math.sin(tt * PI * 2.6)) * (1 - tt) * Hh * 0.22;
        x += (-W * 0.75 - x) * (1 - e); y += (-Hh * 0.55 - y) * (1 - e) - bo;
        size *= 1 + (1 - e) * 0.9; roll = (1 - e) * PI * 5;
      }
      const tr = `rotateX(${rx.toFixed(4)}rad) rotateY(${ry.toFixed(4)}rad) rotateZ(${rz.toFixed(4)}rad) rotate3d(1,.6,.2,${roll.toFixed(4)}rad)`;
      cube!.style.transform = tr;
      el!.style.transform = `translate3d(${(W / 2 + x - H2).toFixed(1)}px,${(Hh / 2 + y - H2).toFixed(1)}px,0) scale(${(size / SZ).toFixed(4)})`;
      const m = new DOMMatrix(tr);
      for (let i = 0; i < 6; i++) {
        const n = F[i][2];
        const q = m.transformPoint(new DOMPoint(n[0], n[1], n[2], 0));
        const d = Math.max(0, q.x * L[0] + q.y * L[1] + q.z * L[2]);
        const st = faces[i]?.style;
        if (!st) continue;
        st.setProperty("--l", (0.6 + 0.4 * d).toFixed(3));
        st.setProperty("--sx", (50 + q.x * 48).toFixed(1) + "%");
        st.setProperty("--sy", (50 + q.y * 48).toFixed(1) + "%");
      }
      cube!.style.setProperty("--h", ((p * 420 + tt * 60) % 360).toFixed(1) + "deg");
      const sr = stick ? stick.getBoundingClientRect() : null;
      const f = k > 0.72 && !mob && !!sr && sr.top < Hh * 0.5 && sr.bottom > Hh * 0.5;
      if (f !== front && !fading) {
        fading = true;
        el!.style.transition = "opacity .18s ease"; el!.style.opacity = "0";
        setTimeout(() => {
          front = f; el!.classList.toggle("fr", f); el!.style.opacity = "";
          setTimeout(() => { el!.style.transition = ""; fading = false; kick(); }, 200);
        }, 180);
      }
      el!.classList.toggle("on", !!t0);
      el!.classList.toggle("out", !!endEl && endEl.getBoundingClientRect().top < Hh * 0.8);
      raf = busy ? requestAnimationFrame(frame) : 0;
    }
    function kick() { goal = window.scrollY; if (!raf) raf = requestAnimationFrame(frame); }
    function onScroll() { kick(); }
    function onResize() { W = window.innerWidth; Hh = window.innerHeight; kick(); }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    kick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="fd" ref={elRef} aria-hidden="true">
      <div className="fd__cube" ref={cubeRef}>
        <i className="fd__core" /><i className="fd__core" /><i className="fd__core" />
        {F.map((f) => (
          <span key={f[1]} className="fd__f" style={{ transform: f[0], ["--fa" as string]: `${f[3]}deg` }}>
            {Array.from({ length: 9 }, (_, i) => <i key={i} className={PIPS[f[1]].includes(i) ? "pip" : ""} />)}
          </span>
        ))}
      </div>
    </div>
  );
}
