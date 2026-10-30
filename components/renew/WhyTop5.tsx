import { getContent } from "@/lib/cms";

type Why = { no: number; title: string; desc?: string };

const FALLBACK: Why[] = [
  { no: 1, title: "SEO·GEO·AEO를 모두 다루는 통합 전문 회사" },
  { no: 2, title: "네이버·구글·쿠팡 광고 대행 동시 운영" },
  { no: 3, title: "AI 검색 시대에 선제 대응하는 GEO 설계 역량" },
  { no: 4, title: "감이 아닌 대시보드, 실시간 투명 리포팅" },
  { no: 5, title: "파트너 재계약률 98%가 증명하는 신뢰" },
];

export default async function WhyTop5() {
  const rows = await getContent<Why>("why");
  const items = rows?.map((r) => r.data) ?? FALLBACK;
  return (
    <section className="s"><div className="w">
      <span className="lab">05 / WHY</span>
      <h2 className="en">WHY FACTA</h2>
      <div className="t5w">
        {items.map((w, i) => (
          <div className="t5" key={w.title}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <h4>{w.title}</h4>
            <span className="a">→</span>
          </div>
        ))}
      </div>
    </div></section>
  );
}
