"use client";
import { useEffect, useState, Suspense } from "react";
import { Topbar, adminFetch, useDays, FilterChips, StatusChip, Drawer, Kpi, fmtDate } from "@/components/admin/ui";
import { useAdminMe } from "@/components/admin/AdminContext";

type Row = { id: string; no: number; created_at: string; keyword: string; url: string; overall: number | null; grade: string | null; name: string | null; contact: string | null; status: string };
type ListResp = { rows: Row[]; total: number; page: number; pageSize: number; chips: { status: string; count: number }[]; kpi: { avgScore: number; contactRate: number; converted: number } };
type Detail = Row & { memo: string; axes: { content: number; structure: number; authority: number; citation: number }; linkedInquiries: { id: string; no: number; status: string }[] };

const STATUSES = [
  { value: "", label: "전체" }, { value: "new", label: "신규" }, { value: "reviewed", label: "검토됨" },
  { value: "contacted", label: "연락함" }, { value: "converted", label: "문의전환" },
];

function DiagnosesInner() {
  const days = useDays(0);
  const me = useAdminMe();
  const [data, setData] = useState<ListResp | null>(null);
  const [st, setSt] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function load() {
    const params = new URLSearchParams({ p: String(page) });
    if (days) params.set("d", String(days));
    if (st) params.set("st", st);
    if (q) params.set("q", q);
    adminFetch<ListResp>(`/api/admin/diagnoses?${params}`).then(setData).catch(() => {});
  }
  useEffect(load, [days, st, q, page]);

  function openDrawer(id: string) {
    setOpenId(id);
    adminFetch<Detail>(`/api/admin/diagnoses/${id}`).then(setDetail).catch(() => {});
  }

  async function reveal(id: string) {
    try {
      const res = await adminFetch<{ name: string; contact: string }>("/api/admin/pii", { method: "POST", body: JSON.stringify({ table: "diagnoses", id }) });
      setData((d) => d ? { ...d, rows: d.rows.map((r) => r.id === id ? { ...r, name: res.name, contact: res.contact } : r) } : d);
      setRevealed((s) => new Set(s).add(id));
    } catch { /* ignore */ }
  }

  async function savePatch(patch: { status?: string; memo?: string }) {
    if (!openId) return;
    setBusy(true);
    try { await adminFetch(`/api/admin/diagnoses/${openId}`, { method: "PATCH", body: JSON.stringify(patch) }); openDrawer(openId); load(); }
    finally { setBusy(false); }
  }

  async function rerun() {
    if (!openId) return;
    setBusy(true);
    try { await adminFetch(`/api/admin/diagnoses/${openId}/rerun`, { method: "POST" }); load(); setOpenId(null); }
    finally { setBusy(false); }
  }

  return (
    <>
      <Topbar title="진단 DB" sub="facta.kr · 무료진단 신청 관리" showRange={false} />
      <section className="page">
        <div className="tools">
          <FilterChips items={STATUSES.map((s) => ({ ...s, count: s.value ? data?.chips.find((c) => c.status === s.value)?.count : undefined }))} active={st} onChange={(v) => { setSt(v); setPage(1); }} />
          <input placeholder="키워드·URL 검색" style={{ marginLeft: "auto" }} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          {me.r === "owner" && <a className="btn pri" href={`/api/admin/export?type=diagnoses${st ? `&st=${st}` : ""}`}>CSV 내보내기</a>}
        </div>
        {data && (
          <div className="grid g3" style={{ marginBottom: 14 }}>
            <Kpi label="평균 점수" value={data.kpi.avgScore} />
            <Kpi label="연락처 남긴 비율" value={`${data.kpi.contactRate}%`} />
            <Kpi label="문의로 이어진 수" value={data.kpi.converted} />
          </div>
        )}
        <div className="card" style={{ padding: "6px 8px" }}>
          <table>
            <thead><tr><th>신청</th><th>상태</th><th>키워드</th><th>URL</th><th className="n">점수</th><th>등급</th><th>연락처</th><th>문의 연결</th></tr></thead>
            <tbody>
              {data?.rows.map((r) => (
                <tr className="rw" key={r.id} onClick={() => openDrawer(r.id)}>
                  <td className="mono">D-{r.no}<br /><span style={{ color: "var(--g3)", fontSize: 11 }}>{fmtDate(r.created_at)}</span></td>
                  <td><StatusChip status={r.status} /></td>
                  <td>{r.keyword}</td>
                  <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</td>
                  <td className="n mono">{r.overall ?? "-"}</td>
                  <td>{r.grade || "-"}</td>
                  <td className={r.contact ? (revealed.has(r.id) ? "" : "mask") : ""}>{r.contact || "-"}</td>
                  <td>{r.status === "converted" ? "✓" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.rows.length === 0 && <div className="empty">신청 없음</div>}
        </div>
        {data && (
          <div className="pager">
            <span>{data.total}건 중 {(page - 1) * data.pageSize + 1}–{Math.min(page * data.pageSize, data.total)}</span>
            <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>이전</button>
            <button className="btn" disabled={page * data.pageSize >= data.total} onClick={() => setPage((p) => p + 1)}>다음</button>
          </div>
        )}
      </section>

      <Drawer
        open={!!openId} onClose={() => setOpenId(null)}
        title={detail ? `D-${detail.no}` : "..."} kicker={detail?.created_at ? fmtDate(detail.created_at) : ""}
        footer={openId && <>
          {detail?.contact && <button className="btn" onClick={() => reveal(openId)}>개인정보 보이기</button>}
          <button className="btn pri" onClick={rerun} disabled={busy}>재진단</button>
        </>}
      >
        {detail && (
          <>
            <dl className="kv">
              <dt>키워드</dt><dd>{detail.keyword}</dd>
              <dt>URL</dt><dd>{detail.url}</dd>
              <dt>연락처</dt><dd>{detail.contact || "-"}</dd>
            </dl>
            <div className="axes">
              {([["콘텐츠", detail.axes?.content], ["구조", detail.axes?.structure], ["권위", detail.axes?.authority], ["인용", detail.axes?.citation]] as [string, number][]).map(([n, v]) => (
                <div className="r" key={n}><span>{n}</span><div className="bar"><i style={{ width: `${v || 0}%` }} /></div><span className="mono n">{v ?? "-"}</span></div>
              ))}
            </div>
            <label htmlFor="diag-status">상태</label>
            <select id="diag-status" defaultValue={detail.status} onChange={(e) => savePatch({ status: e.target.value })} disabled={busy}>
              <option value="new">신규</option><option value="reviewed">검토됨</option><option value="contacted">연락함</option><option value="converted">문의전환</option>
            </select>
            <label htmlFor="diag-memo">메모</label>
            <textarea id="diag-memo" defaultValue={detail.memo} onBlur={(e) => savePatch({ memo: e.target.value })} disabled={busy} />
            {detail.linkedInquiries.length > 0 && (
              <>
                <label>연결된 문의</label>
                <div className="tl">{detail.linkedInquiries.map((i) => <div key={i.id}>Q-{i.no} · {i.status}</div>)}</div>
              </>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}

export default function DiagnosesPage() {
  return <Suspense><DiagnosesInner /></Suspense>;
}
