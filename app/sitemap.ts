import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { getPosts } from "@/lib/sanity";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/insights`, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({ url: `${site.url}/insights/${p.slug}`, lastModified: p.date, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
