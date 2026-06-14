import Reveal from "./Reveal";
import { getPosts } from "@/lib/sanity";

export default async function InsightsPreview() {
  const posts = (await getPosts()).slice(0, 3);
  return (
    <section className="block" id="insights"><div className="wrap">
      <Reveal className="sec-head"><span className="eyebrow">Insights</span><h2>AEO 시대의 마케팅 인사이트</h2><p>검색·AI·퍼포먼스의 변화를 데이터 관점으로 해석합니다.</p></Reveal>
      <div className="insights-grid">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 60}>
            <a className="post-card" href={`/insights/${p.slug}`}>
              <div className="pc-body">
                <span className="pc-tag">{p.category}</span>
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
                <span className="pc-meta">{p.date} · {p.author}</span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </div></section>
  );
}
