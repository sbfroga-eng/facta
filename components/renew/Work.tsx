import { getContent } from "@/lib/cms";

type WorkItem = { title: string; client?: string; tag: string; result: string };

const FALLBACK: WorkItem[] = [
  { title: "커머스 브랜드 A", tag: "SEO · COMMERCE", result: "자연 유입 320% 증가" },
  { title: "뷰티 브랜드 B", tag: "ADS · BEAUTY", result: "ROAS 680% 달성" },
  { title: "테크 기업 C", tag: "GEO · TECH", result: "AI 인용 5배 증가" },
  { title: "로컬 매장 D", tag: "LSM · LOCAL", result: "지역 키워드 1위" },
  { title: "식품 브랜드 E", tag: "VIRAL · FOOD", result: "도달 12만" },
  { title: "패션 브랜드 F", tag: "SEO · FASHION", result: "검색 점유율 2배" },
  { title: "교육 기업 G", tag: "AEO · EDU", result: "답변 엔진 노출" },
  { title: "금융 서비스 H", tag: "ADS · FINANCE", result: "CPA 41% 절감" },
];

export default async function Work() {
  const rows = await getContent<WorkItem>("work");
  const items = rows?.map((r) => r.data) ?? FALLBACK;
  return (
    <section className="s wm" id="ref"><div className="w">
      <span className="lab">04 / WORK</span>
      <h2 className="en">SELECTED CASES</h2>
      <div className="pg">
        {items.map((w) => (
          <div className="pc" key={w.title}>
            <div className="th"><span>{w.tag}</span></div>
            <div className="nm">{w.title}</div>
            <div className="ds">{w.result}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <a href="/insights" className="allbtn" data-track="work_more">
          <span className="n">{items.length}</span><span className="t">PROJECTS<b>더 많은 이야기 보기</b></span><span className="go">→</span>
        </a>
      </div>
    </div></section>
  );
}
