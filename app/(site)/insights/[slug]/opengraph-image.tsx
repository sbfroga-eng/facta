import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPost } from "@/lib/sanity";

export const alt = "FACTA 마케팅 인사이트";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(): Promise<Buffer | null> {
  for (const p of [
    join(process.cwd(), "assets/NotoSansKR-Bold.otf"),
    join(process.cwd(), ".next/server/assets/NotoSansKR-Bold.otf"),
  ]) {
    try {
      return await readFile(p);
    } catch {
      /* 다음 경로 시도 */
    }
  }
  return null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const title = post?.title ?? "마케팅 인사이트";
  const category = post?.category ?? "FACTA";
  const font = await loadFont();

  const el = (
    <div
      style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "space-between", background: "#0C0C0E", padding: "72px 80px",
        ...(font ? { fontFamily: "NotoKR" } : {}),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 14, height: 42, background: "#E9470A", borderRadius: 4, display: "flex" }} />
        <div style={{ fontSize: 30, color: "#E9470A", letterSpacing: -1 }}>{category}</div>
      </div>
      <div style={{ display: "flex", fontSize: 62, color: "#ffffff", lineHeight: 1.24, letterSpacing: -2.5 }}>
        {font ? title : "FACTA Insights"}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", fontSize: 36, color: "#ffffff", letterSpacing: 3 }}>FACTA</div>
        <div style={{ display: "flex", fontSize: 23, color: "#8A8A92" }}>
          {font ? "데이터와 타이밍으로 성장을 설계하다" : "fact + timing"}
        </div>
      </div>
    </div>
  );

  return new ImageResponse(el, {
    ...size,
    ...(font ? { fonts: [{ name: "NotoKR", data: font, style: "normal" as const, weight: 700 as const }] } : {}),
  });
}
