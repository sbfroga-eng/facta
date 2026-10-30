"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export async function adminFetch<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  if (res.status === 401) {
    window.location.href = "/admin/login?next=" + encodeURIComponent(window.location.pathname);
    throw new Error("unauthorized");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `요청 실패(${res.status})`);
  return json as T;
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2200);
    return () => clearTimeout(t);
  }, [msg]);
  return { msg, show: setMsg, node: <div className={`toast${msg ? " on" : ""}`}>{msg}</div> };
}

export function Topbar({ title, sub, showRange = true, live }: { title: string; sub: string; showRange?: boolean; live?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const d = sp.get("d") || "30";

  function setDays(nd: string) {
    const params = new URLSearchParams(sp.toString());
    params.set("d", nd);
    params.set("p", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="top">
      <div><h1>{title}</h1><div className="sub mono">{sub}</div></div>
      {showRange && (
        <div className="seg">
          {["1", "7", "30", "90"].map((v) => (
            <button key={v} className={d === v ? "on" : ""} onClick={() => setDays(v)}>
              {v === "1" ? "오늘" : `${v}일`}
            </button>
          ))}
        </div>
      )}
      {typeof live === "number" && <div className="live mono">실시간 {live}명</div>}
    </div>
  );
}

export function useDays(defaultDays = 30): number {
  const sp = useSearchParams();
  const d = Number(sp.get("d")) || defaultDays;
  return d;
}

const STATUS_LABEL: Record<string, string> = {
  new: "신규", contacted: "연락함", meeting: "미팅", won: "성사", lost: "실패", hold: "보류",
  reviewed: "검토됨", converted: "문의전환",
};

export function StatusChip({ status }: { status: string }) {
  return <span className={`chip s-${status}`}>{STATUS_LABEL[status] || status}</span>;
}

export function FilterChips({ items, active, onChange }: { items: { value: string; label: string; count?: number }[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="fchips">
      {items.map((it) => (
        <button key={it.value || "all"} className={active === it.value ? "on" : ""} onClick={() => onChange(it.value)}>
          {it.label}{typeof it.count === "number" && <b>{it.count}</b>}
        </button>
      ))}
    </div>
  );
}

export function Kpi({ label, value, delta, dark }: { label: string; value: string | number; delta?: number; dark?: boolean }) {
  return (
    <div className={`card kpi${dark ? " dk" : ""}`}>
      <div className="l mono">{label}</div>
      <div className="v">{value}</div>
      {typeof delta === "number" && (
        <div className={`d mono ${delta >= 0 ? "up" : "dn"}`}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%</div>
      )}
    </div>
  );
}

export function Bar({ pct, color }: { pct: number; color?: string }) {
  return <div className="bar"><i style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} /></div>;
}

export function LineChart({ series, width = 640, height = 140 }: { series: { color: string; values: number[] }[]; width?: number; height?: number }) {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const n = Math.max(1, ...series.map((s) => s.values.length)) - 1 || 1;
  const toPoints = (values: number[]) =>
    values.map((v, i) => `${(i / n) * width},${height - (v / max) * (height - 10) - 5}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {series.map((s, i) => (
        <polyline key={i} fill="none" stroke={s.color} strokeWidth={2} points={toPoints(s.values)} />
      ))}
    </svg>
  );
}

export function Drawer({ open, onClose, title, kicker, children, footer }: {
  open: boolean; onClose: () => void; title: string; kicker?: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <>
      <div className={`dim${open ? " on" : ""}`} onClick={onClose} />
      <aside className={`dw${open ? " on" : ""}`}>
        <div className="hd">
          <div><div className="mono" style={{ fontSize: 10.5, color: "var(--g3)" }}>{kicker}</div><h4>{title}</h4></div>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="bd">{children}</div>
        {footer && <div className="ft">{footer}</div>}
      </aside>
    </>
  );
}

export function fmtDate(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" }).replace(/\. /g, ".").replace(",", "");
}
