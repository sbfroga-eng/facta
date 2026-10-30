import { getContent } from "@/lib/cms";

type Metric = { label: string; value: number; unit: string; desc?: string };

const FALLBACK: { k: string; v: number; u: string; d: string }[] = [
  { k: "TRAFFIC", v: 320, u: "%", d: "평균 자연 유입 증가" },
  { k: "ROAS", v: 680, u: "%", d: "퍼포먼스 광고 수익률" },
  { k: "RETENTION", v: 98, u: "%", d: "파트너 재계약률" },
];

export default async function Numbers() {
  const rows = await getContent<Metric>("metric");
  const items = rows?.map((r) => ({ k: r.data.desc || r.data.label, v: r.data.value, u: r.data.unit, d: r.data.label })) ?? FALLBACK;
  return (
    <section className="s dk"><div className="w">
      <span className="lab">03 / NUMBERS</span>
      <h2 className="en">PROVEN BY DATA</h2>
      <div className="nums">
        {items.map((n) => (
          <div className="nu" key={n.d}>
            <div className="k">{n.k}</div>
            <div className="v">{n.v}<s>{n.u}</s></div>
            <div className="d">{n.d}</div>
          </div>
        ))}
      </div>
    </div></section>
  );
}
