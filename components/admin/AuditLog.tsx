"use client";
import { useEffect, useState } from "react";
import { adminFetch, fmtDate } from "./ui";
import { useAdminMe } from "./AdminContext";

type AuditRow = { id: number; ts: string; actor: string; action: string; target: string | null; detail: Record<string, unknown> };

export default function AuditLog() {
  const me = useAdminMe();
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (me.r !== "owner") return;
    adminFetch<{ rows: AuditRow[] }>("/api/admin/audit").then((d) => setRows(d.rows)).catch((e) => setErr(e.message));
  }, [me.r]);

  if (me.r !== "owner") return <div className="empty">감사 로그는 owner 만 볼 수 있습니다.</div>;
  if (err) return <div className="note">{err}</div>;

  return (
    <table>
      <thead><tr><th>시각</th><th>관리자</th><th>행동</th><th>대상</th></tr></thead>
      <tbody>
        {rows?.map((r) => (
          <tr key={r.id}><td className="mono">{fmtDate(r.ts)}</td><td>{r.actor}</td><td>{r.action}</td><td className="mono">{r.target || "-"}</td></tr>
        ))}
        {rows && rows.length === 0 && <tr><td className="empty">기록 없음</td></tr>}
      </tbody>
    </table>
  );
}
