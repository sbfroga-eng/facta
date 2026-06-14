"use client";
import { useEffect, useState } from "react";

const FULL = "검색의 모든 접점에서, 데이터와 타이밍으로 성장을 설계합니다";

type Seg = { t: string; br?: boolean; grad?: boolean };
const segs: Seg[] = [
  { t: "검색의 모든 접점에서,", br: true },
  { t: "데이터와 타이밍", grad: true },
  { t: "으로", br: true },
  { t: "성장을 설계합니다" },
];

type Tok = { ch?: string; br?: boolean; grad?: boolean };
const tokens: Tok[] = [];
segs.forEach((s) => {
  for (const ch of Array.from(s.t)) tokens.push({ ch, grad: s.grad });
  if (s.br) tokens.push({ br: true });
});
const TOTAL = tokens.filter((t) => t.ch).length;

export default function TypedHeadline() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let c = 0;
    let timer: ReturnType<typeof setTimeout>;
    const start = setTimeout(function step() {
      c += 1;
      setCount(c);
      if (c < TOTAL) timer = setTimeout(step, 62);
    }, 380);
    return () => { clearTimeout(start); clearTimeout(timer); };
  }, []);

  const nodes: React.ReactNode[] = [];
  let typed = 0, key = 0;
  for (const tk of tokens) {
    if (tk.ch) {
      if (typed >= count) break;
      nodes.push(<span className={tk.grad ? "grad" : undefined} key={key++}>{tk.ch}</span>);
      typed++;
    } else if (tk.br) {
      nodes.push(<br key={key++} />);
    }
  }

  return (
    <h1>
      <span className="sr-only">{FULL}</span>
      <span aria-hidden="true">
        {nodes}
        <span className="type-cursor">_</span>
      </span>
    </h1>
  );
}
