"use client";
import { useEffect, useState, Suspense } from "react";
import { Topbar, adminFetch, useDays, FilterChips, StatusChip, Drawer, fmtDate } from "@/components/admin/ui";
import { useAdminMe } from "@/components/admin/AdminContext";

type Row = { id: string; no: number; created_at: string; name: string; contact: string; brand: string | null; service: string | null; referrer_host: string | null; status: string; assignee: string | null };
type ListResp = { rows: Row[]; total: number; page: number; pageSize: number; chips: { status: string; count: number }[] };
type Detail = Row & { message: string | null; memo: string; diagnosis_id: string | null; events: { ts: string; actor: string; action: string; before: string; after: string }[]; diagnosis: { id: string; no: number; keyword: string; overall: number; grade: string } | null };

const STATUSES = [
  { value: "", label: "전체" }, { value: "new", label: "신규" }, { value: "contacted", label: "연락함" },
  { value: "meeting", label: "미팅" }, { value: "won", label: "성사" }, { value: "lost", label: "실패" }, { value: "hold", label: "보류" },
];

function InquiriesInner() {
  const days = useDays(0);
  const me = useAdminMe();
  const [data, setData] = useState<ListResp | null>(null);
  const [st, setSt] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  function load() {
    const params = new URLSearchParams({ p: String(page) });
    if (days) params.set("d", String(days));
    if (st) params.set("st", st);
    if (q) params.set("q", q);
    adminFetch<ListResp>(`/api/admin/inquiries?${params}`).then(setData).catch(() => {});
  }
  useEffect(load, [days, st, q, page]);

  function openDrawer(id: string) {
    setOpenId(id);
    adminFetch<Detail>(`/api/admin/inquiries/${id}`).then(setDetail).catch(() => {});
  }

  async function reveal(id: string) {
    const row = data?.rows.find((r) => r.id === id);
    if (!row) return;
    try {
      const res = await adminFetch<{ name: string; contact: string }>("/api/admin/pii", {
        method: "POST", body: JSON.stringify({ table: "inquiries", id }),
      });
      setData((d) => d ? { ...d, rows: d.rows.map((r) => r.id === id ? { ...r, name: res.name, contact: res.contact } : r) } : d);
      setRevealed((s) => new Set(s).add(id));
    } catch { /* ignore */ }
  }

  async function savePatch(patch: { status?: string; assignee?: string; memo?: string }) {
    if (!openId) return;
    setSaving(true);
    try {
      await adminFetch(`/api/admin/inquiries/${openId}`, { method: "PATCH", body: JSON.stringify(patch) });
      openDrawer(openId);
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Topbar title="문의 DB" sub="facta.kr · 문의 접수 관리" showRange={false} />
      <section className="page">
        <div className="tools">
          <FilterChips items={STATUSES.map((s) => ({ ...s, count: s.value ? data?.chips.find((c) => c.status === s.value)?.count : undefined }))} active={st} onChange={(v) => { setSt(v); setPage(1); }} />
          <input placeholder="이름·연락처·브랜드 검색" style={{ marginLeft: "auto" }} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          {me.r === "owner" && <a className="btn pri" href={`/api/admin/export?type=inquiries${st ? `&st=${st}` : ""}`}>CSV 내보내기</a>}
        </div>
        <div className="card" style={{ padding: "6px 8px" }}>
          <table>
            <thead><tr><th>접수</th><th>상태</th><th>이름</th><th>연락처</th><th>브랜드</th><th>관심 서비스</th><th>유입</th><th>담당</th></tr></thead>
            <tbody>
              {data?.rows.map((r) => (
                <tr className="rw" key={r.id} onClick={() => openDrawer(r.id)}>
                  <td className="mono">Q-{r.no}<br /><span style={{ color: "var(--g3)", fontSize: 11 }}>{fmtDate(r.created_at)}</span></td>
                  <td><StatusChip status={r.status} /></td>
                  <td className={revealed.has(r.id) ? "" : "mask"}>{r.name}</td>
                  <td className={`mono ${revealed.has(r.id) ? "" : "mask"}`}>{r.contact}</td>
                  <td>{r.brand || "-"}</td>
                  <td>{r.service || "-"}</td>
                  <td>{r.referrer_host || "direct"}</td>
                  <td>{r.assignee || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.rows.length === 0 && <div className="empty">문의 없음</div>}
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
        title={detail ? `Q-${detail.no}` : "..."} kicker={detail?.created_at ? fmtDate(detail.created_at) : ""}
        footer={openId && <button className="btn" onClick={() => reveal(openId)}>개인정보 보이기</button>}
      >
        {detail && (
          <>
            <dl className="kv">
              <dt>이름</dt><dd>{detail.name}</dd>
              <dt>연락처</dt><dd>{detail.contact}</dd>
              <dt>브랜드</dt><dd>{detail.brand || "-"}</dd>
              <dt>서비스</dt><dd>{detail.service || "-"}</dd>
              <dt>유입</dt><dd>{detail.referrer_host || "direct"}</dd>
              <dt>내용</dt><dd>{detail.message || "-"}</dd>
              {detail.diagnosis && <><dt>연결 진단</dt><dd>{detail.diagnosis.keyword} · {detail.diagnosis.overall}점 ({detail.diagnosis.grade})</dd></>}
            </dl>
            <label htmlFor="inq-status">상태</label>
            <select id="inq-status" defaultValue={detail.status} onChange={(e) => savePatch({ status: e.target.value })} disabled={saving}>
              <option value="new">신규</option><option value="contacted">연락함</option><option value="meeting">미팅</option>
              <option value="won">성사</option><option value="lost">실패</option><option value="hold">보류</option>
            </select>
            <label htmlFor="inq-assignee">담당</label>
            <input id="inq-assignee" defaultValue={detail.assignee || ""} onBlur={(e) => savePatch({ assignee: e.target.value })} disabled={saving} />
            <label htmlFor="inq-memo">메모</label>
            <textarea id="inq-memo" defaultValue={detail.memo} onBlur={(e) => savePatch({ memo: e.target.value })} disabled={saving} />
            <label>처리 이력</label>
            <div className="tl">
              {detail.events.map((e, i) => <div key={i}><b>{e.actor}</b> {e.action}: {e.before || "-"} → {e.after || "-"} <span style={{ color: "var(--g3)" }}>({fmtDate(e.ts)})</span></div>)}
              {detail.events.length === 0 && <div className="empty">이력 없음</div>}
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}

export default function InquiriesPage() {
  return <Suspense><InquiriesInner /></Suspense>;
}
