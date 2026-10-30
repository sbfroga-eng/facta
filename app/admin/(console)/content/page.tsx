"use client";
import { useEffect, useState } from "react";
import { Topbar, adminFetch, Drawer, useToast } from "@/components/admin/ui";

type Item = { id: string; kind: string; sort: number; published: boolean; data: Record<string, string | number>; version: number };

const KINDS: { value: string; label: string }[] = [
  { value: "service", label: "서비스" }, { value: "metric", label: "성과 수치" }, { value: "why", label: "차별점" },
  { value: "faq", label: "FAQ" }, { value: "work", label: "작업 사례" }, { value: "signal", label: "시그널" }, { value: "notice", label: "공지" },
];

const FIELDS: Record<string, { key: string; label: string; type: "text" | "textarea" | "number" }[]> = {
  service: [{ key: "code", label: "코드", type: "text" }, { key: "title", label: "제목", type: "text" }, { key: "desc", label: "설명", type: "textarea" }, { key: "tag", label: "태그", type: "text" }],
  metric: [{ key: "label", label: "라벨", type: "text" }, { key: "value", label: "값", type: "number" }, { key: "unit", label: "단위", type: "text" }, { key: "desc", label: "설명", type: "textarea" }],
  why: [{ key: "no", label: "번호", type: "number" }, { key: "title", label: "제목", type: "text" }, { key: "desc", label: "설명", type: "textarea" }],
  faq: [{ key: "q", label: "질문", type: "text" }, { key: "a", label: "답변", type: "textarea" }],
  work: [{ key: "title", label: "제목", type: "text" }, { key: "client", label: "클라이언트", type: "text" }, { key: "tag", label: "태그", type: "text" }, { key: "result", label: "결과", type: "text" }],
  signal: [{ key: "head", label: "헤드", type: "text" }, { key: "body", label: "본문", type: "textarea" }],
  notice: [{ key: "text", label: "문구", type: "text" }, { key: "link", label: "링크", type: "text" }, { key: "until", label: "노출 종료일", type: "text" }],
};

function titleOf(kind: string, data: Record<string, string | number>): string {
  if (kind === "faq") return String(data.q || "");
  if (kind === "metric") return `${data.label} — ${data.value}${data.unit || ""}`;
  return String(data.title || data.text || data.head || "(제목 없음)");
}
function subOf(kind: string, data: Record<string, string | number>): string {
  if (kind === "faq") return String(data.a || "");
  return String(data.desc || data.body || data.client || "");
}

export default function ContentPage() {
  const [kind, setKind] = useState("service");
  const [items, setItems] = useState<Item[]>([]);
  const [openItem, setOpenItem] = useState<Item | null>(null);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [creating, setCreating] = useState(false);
  const { show, node } = useToast();

  function load(k: string) {
    adminFetch<{ rows: Item[] }>(`/api/admin/content?kind=${k}`).then((d) => setItems(d.rows)).catch(() => {});
  }
  useEffect(() => { load(kind); }, [kind]);

  function openEdit(item: Item) { setOpenItem(item); setForm({ ...item.data }); setCreating(false); }
  function openCreate() { setOpenItem({ id: "", kind, sort: items.length, published: true, data: {}, version: 0 }); setForm({}); setCreating(true); }

  async function save() {
    if (!openItem) return;
    try {
      if (creating) {
        await adminFetch("/api/admin/content", { method: "POST", body: JSON.stringify({ kind, data: form }) });
      } else {
        await adminFetch(`/api/admin/content/${openItem.id}`, { method: "PATCH", body: JSON.stringify({ data: form }) });
      }
      show("저장했습니다. 1분 안에 홈페이지에 반영됩니다.");
      setOpenItem(null);
      load(kind);
    } catch (e) { show(e instanceof Error ? e.message : "저장 실패"); }
  }

  async function togglePublish(item: Item) {
    try {
      await adminFetch(`/api/admin/content/${item.id}`, { method: "PATCH", body: JSON.stringify({ published: !item.published }) });
      load(kind);
    } catch (e) { show(e instanceof Error ? e.message : "변경 실패"); }
  }

  async function move(item: Item, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === item.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const order = [...items];
    [order[idx], order[swapIdx]] = [order[swapIdx], order[idx]];
    setItems(order);
    try { await adminFetch("/api/admin/content/reorder", { method: "POST", body: JSON.stringify({ kind, order: order.map((i) => i.id) }) }); }
    catch { load(kind); }
  }

  return (
    <>
      <Topbar title="콘텐츠 관리" sub="facta.kr · 홈페이지 문구 관리" showRange={false} />
      <section className="page">
        <div className="note">여기서 고친 문구는 <b>저장 후 1분 안에 홈페이지에 반영</b>됩니다(캐시 60초). DB 가 비어 있거나 연결이 끊기면 코드에 들어 있는 기본 문구로 자동 표시됩니다.</div>
        <div className="tools">
          <div className="ctabs fchips">
            {KINDS.map((k) => <button key={k.value} className={kind === k.value ? "on" : ""} onClick={() => setKind(k.value)}>{k.label}</button>)}
          </div>
          <button className="btn lime" style={{ marginLeft: "auto" }} onClick={openCreate}>+ 항목 추가</button>
        </div>
        <div>
          {items.map((it) => (
            <div key={it.id} className={`citem${it.published ? "" : " off"}`}>
              <div className="mv"><button onClick={() => move(it, -1)}>▲</button><button onClick={() => move(it, 1)}>▼</button></div>
              <div onClick={() => openEdit(it)} style={{ cursor: "pointer" }}>
                <div className="t">{titleOf(kind, it.data)}</div>
                <div className="s">{subOf(kind, it.data)}</div>
              </div>
              <div className="cact">
                <button className={`sw${it.published ? " on" : ""}`} onClick={() => togglePublish(it)} aria-label="공개 전환" />
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="empty">아직 항목이 없습니다 — 코드 기본값이 표시되고 있어요.</div>}
        </div>
      </section>

      <Drawer
        open={!!openItem} onClose={() => setOpenItem(null)} title={creating ? "항목 추가" : "항목 수정"} kicker={KINDS.find((k) => k.value === kind)?.label}
        footer={<button className="btn pri" onClick={save}>저장</button>}
      >
        {(FIELDS[kind] || []).map((f) => (
          <div key={f.key}>
            <label htmlFor={`f-${f.key}`}>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea id={`f-${f.key}`} value={String(form[f.key] ?? "")} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} />
            ) : (
              <input id={`f-${f.key}`} type={f.type === "number" ? "number" : "text"} value={String(form[f.key] ?? "")}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))} />
            )}
          </div>
        ))}
      </Drawer>
      {node}
    </>
  );
}
