import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getPosts } from "@/lib/sanity";
import { breadcrumbLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "인사이트",
  description: "SEO·GEO·LSM·퍼포먼스 마케팅의 변화를 데이터 관점으로 해석한 FACTA의 마케팅 인사이트.",
  alternates: { canonical: "/insights" },
};

export default async function InsightsPage() {
  const posts = await getPosts();
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd([{ name: "펙타", url: "/" }, { name: "마케팅 인사이트", url: "/insights" }])) }} />
      <Header />
      <div className="page-head"><div className="wrap"><h1>인사이트</h1><p>AEO 시대의 검색·AI·퍼포먼스 마케팅을 데이터로 해석합니다.</p></div></div>
      <section className="block"><div className="wrap">
        <div className="insights-grid">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 60}>
              <a className="post-card" href={`/insights/${p.slug}`}>
                <div className="pc-body">
                  <span className="pc-tag">{p.category}</span>
                  <h3>{p.title}</h3><p>{p.excerpt}</p>
                  <span className="pc-meta">{p.date} · {p.author}</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div></section>
      <Footer />
    </main>
  );
}
