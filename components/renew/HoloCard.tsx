"use client";
import { useRef } from "react";

export default function HoloCard({ no, code, title, desc, tag }: { no: number; code: string; title: string; desc: string; tag: string }) {
  const glareRef = useRef<HTMLSpanElement>(null);
  const pending = useRef(0);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (pending.current) return;
    const target = e.currentTarget;
    const x = e.clientX, y = e.clientY;
    pending.current = requestAnimationFrame(() => {
      pending.current = 0;
      const r = target.getBoundingClientRect();
      glareRef.current?.style.setProperty("--gx", `${((x - r.left) / r.width) * 100}%`);
      glareRef.current?.style.setProperty("--gy", `${((y - r.top) / r.height) * 100}%`);
    });
  }

  return (
    <div className="ho" onPointerMove={onMove}>
      <span className="shine" /><span className="lines" /><span className="glare" ref={glareRef} />
      <div className="ct2">
        <span className="no">NO.{String(no).padStart(2, "0")}</span>
        <div className="ab">{code}</div>
        <h4>{title}</h4>
        <p>{desc}</p>
        <span className="tag">{tag}</span>
      </div>
    </div>
  );
}
