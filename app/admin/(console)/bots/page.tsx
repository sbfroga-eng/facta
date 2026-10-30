"use client";
import { useEffect, useState, Suspense } from "react";
import { Topbar, adminFetch, useDays, Bar, fmtDate } from "@/components/admin/ui";

type BotsResp = {
  bots: { bot: string; kind: string; hits: number; last_seen: string }[];
  recent: { id: number; ts: string; bot: string; kind: string; path: string }[];
  topPaths: { path: string; ai: number; search: number; total: number }[];
};

const AI_KINDS = new Set(["ai_train", "ai_search", "ai_answer"]);
const KIND_LABEL: Record<string, string> = { search: "검색", ai_train: "AI 학습", ai_search: "AI 검색", ai_answer: "AI 답변", other: "기타" };

function BotsInner() {
  const days = useDays(30);
  const [data, setData] = useState<BotsResp | null>(null);

  useEffect(() => { adminFetch<BotsResp>(`/api/admin/bots?d=${days}`).then(setData).catch(() => {}); }, [days]);

  const max = data ? Math.max(1, ...data.bots.map((b) => b.hits)) : 1;

  return (
    <>
      <Topbar title="AI 크롤러" sub="facta.kr · 검색·AI 크롤러 방문 기록" />
      <section className="page">
        <div className="note">검색·AI 크롤러가 실제로 우리 사이트를 읽어 간 기록입니다(서버에서 User-Agent 로 판별 — GA 에는 안 잡힘). <b>GPTBot·ClaudeBot·PerplexityBot 방문이 늘면 AI 답변에 인용될 재료가 쌓이는 중</b>이라는 뜻입니다.</div>
        <div className="grid g2">
          <div className="card chart"><h3>봇별 방문<span className="k">기간 합계</span></h3>
            {data?.bots.map((b) => (
              <div key={b.bot} style={{ display: "grid", gridTemplateColumns: "140px 1fr 50px", gap: 10, alignItems: "center", margin: "8px 0", fontSize: 12.5 }}>
                <span>{b.bot}</span>
                <Bar pct={(b.hits / max) * 100} color={AI_KINDS.has(b.kind) ? "var(--lime)" : "var(--ink)"} />
                <span className="mono n">{b.hits}</span>
              </div>
            ))}
            {data && data.bots.length === 0 && <div className="empty">기록 없음</div>}
          </div>
          <div className="card"><h3>봇이 많이 읽은 페이지</h3>
            <table><thead><tr><th>경로</th><th className="n">AI</th><th className="n">검색</th></tr></thead>
              <tbody>{data?.topPaths.map((p) => <tr key={p.path}><td>{p.path}</td><td className="n mono">{p.ai}</td><td className="n mono">{p.search}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="card" style={{ marginTop: 14 }}><h3>최근 크롤 기록</h3>
          <table><thead><tr><th>시각</th><th>봇</th><th>분류</th><th>경로</th></tr></thead>
            <tbody>{data?.recent.map((r) => (
              <tr key={r.id}><td className="mono">{fmtDate(r.ts)}</td><td>{r.bot}</td><td><span className="tag">{KIND_LABEL[r.kind] || r.kind}</span></td><td>{r.path}</td></tr>
            ))}</tbody>
          </table>
          {data && data.recent.length === 0 && <div className="empty">기록 없음</div>}
        </div>
      </section>
    </>
  );
}

export default function BotsPage() {
  return <Suspense><BotsInner /></Suspense>;
}
