"use client";
import { useEffect, useState, Suspense } from "react";
import { Topbar, adminFetch, useDays, fmtDate, Drawer } from "@/components/admin/ui";

type EventsResp = {
  rows: { id: number; ts: string; session_id: string; type: string; path: string; section: string | null; referrer_host: string | null; utm_campaign: string | null; device: string | null; country: string | null; city: string | null; duration_ms: number | null }[];
  total: number; page: number; pageSize: number;
  campaigns: { campaign: string; source: string; sessions: number; diag: number; inq: number }[];
  typeSums: { type: string; count: number }[];
};
type SessionResp = { sessionId: string; events: { id: number; ts: string; type: string; path: string; section: string | null; meta: Record<string, unknown> }[] };

const DEVICE_LABEL: Record<string, string> = { pc: "PC", mobile: "모바일", tablet: "태블릿" };

function LogsInner() {
  const days = useDays(30);
  const [data, setData] = useState<EventsResp | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [dev, setDev] = useState("");
  const [page, setPage] = useState(1);
  const [sid, setSid] = useState<string | null>(null);
  const [session, setSession] = useState<SessionResp | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ d: String(days), p: String(page) });
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (dev) params.set("dev", dev);
    adminFetch<EventsResp>(`/api/admin/events?${params}`).then(setData).catch(() => {});
  }, [days, q, type, dev, page]);

  useEffect(() => {
    if (!sid) { setSession(null); return; }
    adminFetch<SessionResp>(`/api/admin/session/${encodeURIComponent(sid)}`).then(setSession).catch(() => {});
  }, [sid]);

  return (
    <>
      <Topbar title="로그 분석" sub="facta.kr · 1st-party 이벤트 원장" />
      <section className="page">
        <div className="note">방문자 브라우저가 보내는 <b>1st-party 이벤트 원장</b>입니다. IP 원문은 저장하지 않고 하루 단위 솔트 해시만 남깁니다. 행을 누르면 해당 세션의 흐름이 열립니다.</div>
        <div className="grid g2e" style={{ marginBottom: 14 }}>
          <div className="card"><h3>UTM 캠페인 성과</h3>
            <table><thead><tr><th>캠페인</th><th>소스</th><th className="n">세션</th><th className="n">진단</th><th className="n">문의</th></tr></thead>
              <tbody>{data?.campaigns.map((c) => (
                <tr key={c.campaign}><td>{c.campaign}</td><td className="mono">{c.source}</td><td className="n">{c.sessions}</td><td className="n">{c.diag}</td><td className="n">{c.inq}</td></tr>
              ))}</tbody>
            </table>
            {data && data.campaigns.length === 0 && <div className="empty">캠페인 유입 없음</div>}
          </div>
          <div className="card"><h3>이벤트 종류별<span className="k">기간 합계</span></h3>
            <table><tbody>{data?.typeSums.map((t) => <tr key={t.type}><td>{t.type}</td><td className="n mono">{t.count}</td></tr>)}</tbody></table>
          </div>
        </div>
        <div className="card">
          <div className="tools">
            <input placeholder="경로·참조·캠페인 검색" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
            <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              <option value="">모든 이벤트</option>
              {data?.typeSums.map((t) => <option key={t.type} value={t.type}>{t.type}</option>)}
            </select>
            <select value={dev} onChange={(e) => { setDev(e.target.value); setPage(1); }}>
              <option value="">모든 기기</option>
              <option value="pc">PC</option><option value="mobile">모바일</option><option value="tablet">태블릿</option>
            </select>
          </div>
          <table>
            <thead><tr><th>시각</th><th>세션</th><th>이벤트</th><th>경로</th><th>유입</th><th>기기</th><th>지역</th><th className="n">체류</th></tr></thead>
            <tbody>
              {data?.rows.map((r) => (
                <tr className="rw" key={r.id} onClick={() => setSid(r.session_id)}>
                  <td className="mono">{fmtDate(r.ts)}</td>
                  <td className="mono">{r.session_id.slice(0, 8)}</td>
                  <td>{r.type}{r.section ? ` · ${r.section}` : ""}</td>
                  <td>{r.path}</td>
                  <td>{r.referrer_host || "-"}{r.utm_campaign ? ` (${r.utm_campaign})` : ""}</td>
                  <td>{r.device ? DEVICE_LABEL[r.device] || r.device : "-"}</td>
                  <td>{[r.country, r.city].filter(Boolean).join(" ") || "-"}</td>
                  <td className="n mono">{r.duration_ms ? `${Math.round(r.duration_ms / 1000)}s` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.rows.length === 0 && <div className="empty">이벤트 없음</div>}
          {data && (
            <div className="pager">
              <span>{data.total}건 중 {(page - 1) * data.pageSize + 1}–{Math.min(page * data.pageSize, data.total)}</span>
              <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>이전</button>
              <button className="btn" disabled={page * data.pageSize >= data.total} onClick={() => setPage((p) => p + 1)}>다음</button>
            </div>
          )}
        </div>
      </section>

      <Drawer open={!!sid} onClose={() => setSid(null)} title="세션 타임라인" kicker={sid?.slice(0, 12)}>
        <div className="tl">
          {session?.events.map((e) => (
            <div key={e.id}><b>{fmtDate(e.ts)}</b> — {e.type}{e.section ? ` (${e.section})` : ""} · {e.path}</div>
          ))}
          {session && session.events.length === 0 && <div className="empty">이벤트 없음</div>}
        </div>
      </Drawer>
    </>
  );
}

export default function LogsPage() {
  return <Suspense><LogsInner /></Suspense>;
}
