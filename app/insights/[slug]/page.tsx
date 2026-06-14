import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { getPost, getPosts } from "@/lib/sanity";
import { site } from "@/lib/content";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "글을 찾을 수 없습니다" };
  return {
    title: post.title, description: post.excerpt,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.date },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const ld = {
    "@context": "https://schema.org", "@type": "Article",
    headline: post.title, description: post.excerpt, datePublished: post.date,
    author: { "@type": "Organization", name: post.author }, publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: `${site.url}/insights/${post.slug}`, inLanguage: "ko-KR",
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="article">
        <span className="a-tag">{post.category}</span>
        <h1>{post.title}</h1>
        <div className="a-meta">{post.date} · {post.author}</div>
        <div className="a-body">
          {post.body.map((line, i) =>
            line.startsWith("## ") ? <h2 key={i}>{line.slice(3)}</h2> : <p key={i}>{line}</p>
          )}
        </div>
        <a className="a-back" href="/insights">← 인사이트 목록으로</a>
      </article>
      <Footer />
    </main>
  );
}
