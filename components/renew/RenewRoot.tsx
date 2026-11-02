"use client";
import { useEffect, useRef } from "react";
import Intro from "./Intro";
import NavGlass from "./NavGlass";
import FollowDie from "./FollowDie";
import FloatDock from "./FloatDock";
import Diagnosis from "@/components/Diagnosis";

export default function RenewRoot({ children }: { children: React.ReactNode }) {
  // ready 는 React className 이 아니라 classList 로 붙인다 — className 으로 다시 그리면 NavGlass 가 붙여 둔 top·lt·nz 클래스가 지워진다
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = document.getElementById("renew-prog");
    if (!p) return;
    let pend = 0;
    function paint() {
      pend = 0;
      const h = document.documentElement;
      const m = h.scrollHeight - h.clientHeight;
      p!.style.transform = `scaleX(${(m > 0 ? h.scrollTop / m : 0).toFixed(4)})`;
    }
    function up() { if (!pend) pend = requestAnimationFrame(paint); }
    window.addEventListener("scroll", up, { passive: true });
    window.addEventListener("resize", up, { passive: true });
    paint();
    return () => { window.removeEventListener("scroll", up); window.removeEventListener("resize", up); };
  }, []);

  useEffect(() => {
    const sel = ".s .lab,.s .en,.s .kr2,.hg,.cmx,.flow,.nums,.pg,.allbtn,.t5w,.qa,.pt,.cg,.dshow .inner";
    const els = Array.from(document.querySelectorAll(sel));
    els.forEach((e) => e.classList.add("rv"));
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <div className="renew" ref={rootRef}>
      <Intro onReady={() => rootRef.current?.classList.add("ready")} />
      <div className="prog" id="renew-prog" />
      <NavGlass />
      {children}
      <FollowDie />
      <FloatDock />
      <Diagnosis />
    </div>
  );
}
