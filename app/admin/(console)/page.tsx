"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Topbar, Kpi, Bar, LineChart, StatusChip, adminFetch, useDays, fmtDate } from "@/components/admin/ui";

type Stats = {
  days: number;
  kpi: { sessions: number; visitors: number; diag: number; inq: number; bots: number; prevSessions: number; prevVisitors: number; prevDiag: number; prevInq: number; prevBots: number };
  convRate: number; prevConvRate: number;
  daily: { day: string; sessions: number; inq: number; diag: number }[];
  funnel: { step: string; sessions: number }[];
  referrer: { label: string; sessions: number }[];
  topPath: { label: string; sessions: number }[];
  topSection: { label: string; sessions: number }[];
  device: { label: string; sessions: number }[];
  country: { label: string; sessions: number }[];
  bots: { bot: string; kind: string; hits: number; last_seen: string }[];
  recentInquiries: { no: number; name: string; contact: string; service: string | null; status: string; created_at: string }[];
  realtime: number;
};

function pct(cur: number, prev: number): number {
  if (prev <= 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

function DashboardInner() {
  const days = useDays(30);
  const [data, setData] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    adminFetch<Stats>(`/api/admin/stats?d=${days}`).then((d) => { if (alive) setData(d); }).catch((e) => { if (alive) setErr(e.message); });
    return () => { alive = false; };
  }, [days]);

  return (
    <>
      <Topbar title="대시보드" sub="facta.kr · 방문·전환·AI 노출을 한눈에" live={data?.realtime} />
      <section className="page">
        {err && <div className="note">{err}</div>}
        {!data ? <div className="empty">불러오는 중...</div> : (
          <>
            <div className="grid g6">
              <Kpi label="SESSIONS" value={data.kpi.sessions} delta={pct(data.kpi.sessions, data.kpi.prevSessions)} />
              <Kpi label="VISITORS" value={data.kpi.visitors} delta={pct(data.kpi.visitors, data.kpi.prevVisitors)} />
              <Kpi label="진단" value={data.kpi.diag} delta={pct(data.kpi.diag, data.kpi.prevDiag)} />
              <Kpi label="문의" value={data.kpi.inq} delta={pct(data.kpi.inq, data.kpi.prevInq)} />
              <Kpi label="진단→문의 전환율" value={`${data.convRate}%`} delta={pct(data.convRate, data.prevConvRate)} />
              <Kpi label="AI 크롤러" value={data.kpi.bots} delta={pct(data.kpi.bots, data.kpi.prevBots)} dark />
            </div>

            <div className="grid g2" style={{ marginTop: 14 }}>
              <div className="card chart">
                <h3>일별 방문 세션 · 문의 · 진단
                  <span className="k leg">
                    <span><i style={{ background: "var(--ink)" }}></i>세션</span>
                    <span><i style={{ background: "var(--neon)" }}></i>문의</span>
                    <span><i style={{ background: "#9AB800" }}></i>진단</span>
                  </span>
                </h3>
                <LineChart series={[
                  { color: "#111111", values: data.daily.map((d) => d.sessions) },
                  { color: "#FF5C00", values: data.daily.map((d) => d.inq) },
                  { color: "#9AB800", values: data.daily.map((d) => d.diag) },
                ]} />
              </div>
              <div className="card funnel">
                <h3>전환 퍼널<span className="k">세션 기준</span></h3>
                {data.funnel.map((f, i) => {
                  const max = data.funnel[0]?.sessions || 1;
                  return (
                    <div className="st" key={f.step}>
                      <span>{f.step}</span>
                      <Bar pct={(f.sessions / max) * 100} color={i === data.funnel.length - 1 ? "var(--lime)" : undefined} />
                      <span className="mono n">{f.sessions}</span>
                    </div>
                  );
                })}
                <div className="note" style={{ marginTop: 14 }}>진단 → 문의 전환이 가장 큰 이탈 구간입니다. 진단 결과 화면의 <b>상담 신청 버튼</b> 클릭률을 함께 보세요.</div>
              </div>
            </div>

            <div className="grid g3" style={{ marginTop: 14 }}>
              <div className="card">
                <h3>유입 경로<span className="k">세션</span></h3>
                <table><tbody>
                  {data.referrer.map((r) => <tr key={r.label}><td>{r.label}</td><td className="n">{r.sessions}</td></tr>)}
                  {data.referrer.length === 0 && <tr><td className="empty">데이터 없음</td></tr>}
                </tbody></table>
              </div>
              <div className="card">
                <h3>많이 본 페이지·섹션</h3>
                <table><tbody>
                  {data.topPath.slice(0, 4).map((r) => <tr key={"p" + r.label}><td>{r.label}</td><td className="n">{r.sessions}</td></tr>)}
                  {data.topSection.slice(0, 4).map((r) => <tr key={"s" + r.label}><td>#{r.label}</td><td className="n">{r.sessions}</td></tr>)}
                </tbody></table>
              </div>
              <div className="card">
                <h3>기기 · 지역</h3>
                <table><tbody>
                  {data.device.map((r) => <tr key={r.label}><td>{r.label}</td><td className="n">{r.sessions}</td></tr>)}
                  {data.country.map((r) => <tr key={r.label}><td>{r.label}</td><td className="n">{r.sessions}</td></tr>)}
                </tbody></table>
              </div>
            </div>

            <div className="grid g2e" style={{ marginTop: 14 }}>
              <div className="card">
                <h3>최근 문의<span className="k"><Link href="/admin/inquiries">전체 보기 →</Link></span></h3>
                <table><thead><tr><th>접수</th><th>이름</th><th>연락처</th><th>서비스</th><th>상태</th></tr></thead><tbody>
                  {data.recentInquiries.map((r) => (
                    <tr key={r.no}><td className="mono">Q-{r.no}</td><td>{r.name}</td><td className="mono">{r.contact}</td><td>{r.service || "-"}</td><td><StatusChip status={r.status} /></td></tr>
                  ))}
                  {data.recentInquiries.length === 0 && <tr><td className="empty">문의 없음</td></tr>}
                </tbody></table>
              </div>
              <div className="card dk">
                <h3>AI 크롤러 방문 (GEO 신호)<span className="k">최근 {days}일</span></h3>
                {data.bots.map((b) => (
                  <div key={b.bot} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                    <span>{b.bot}</span><span className="mono">{b.hits}</span>
                  </div>
                ))}
                {data.bots.length === 0 && <div className="empty" style={{ color: "#999" }}>기록 없음</div>}
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

export default function DashboardPage() {
  return <Suspense><DashboardInner /></Suspense>;
}
