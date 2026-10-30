"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminProvider, type AdminMe } from "./AdminContext";

const NAV: { group: string; items: { href: string; label: string; icon: string; countKey?: "inq" | "diag" }[] }[] = [
  { group: "ANALYTICS", items: [
    { href: "/admin", label: "대시보드", icon: "◧" },
    { href: "/admin/logs", label: "로그 분석", icon: "≋" },
    { href: "/admin/bots", label: "AI 크롤러", icon: "✦" },
  ] },
  { group: "DATABASE", items: [
    { href: "/admin/inquiries", label: "문의 접수", icon: "✉", countKey: "inq" },
    { href: "/admin/diagnoses", label: "무료진단 신청", icon: "◎", countKey: "diag" },
    { href: "/admin/content", label: "콘텐츠 관리", icon: "▤" },
  ] },
  { group: "SYSTEM", items: [{ href: "/admin/settings", label: "설정 · 감사 로그", icon: "⚙" }] },
];

export default function AdminShell({ children, me }: { children: React.ReactNode; me: AdminMe }) {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState<{ inq: number; diag: number }>({ inq: 0, diag: 0 });

  useEffect(() => {
    fetch("/api/admin/inquiries?st=new&p=1", { cache: "no-store" }).then((r) => r.json()).then((d) => setCounts((c) => ({ ...c, inq: d.total || 0 }))).catch(() => {});
    fetch("/api/admin/diagnoses?st=new&p=1", { cache: "no-store" }).then((r) => r.json()).then((d) => setCounts((c) => ({ ...c, diag: d.total || 0 }))).catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <AdminProvider me={me}>
    <div className="adm">
      <div className="app">
        <aside className="side">
          <div className="lg">FACTA<b>ADMIN</b></div>
          {NAV.map((g) => (
            <div key={g.group}>
              <div className="grp">{g.group}</div>
              <nav className="nav">
                {g.items.map((it) => (
                  <Link key={it.href} href={it.href} className={pathname === it.href ? "on" : ""}>
                    <i>{it.icon}</i>{it.label}
                    {it.countKey && counts[it.countKey] > 0 && <span className="cnt">{counts[it.countKey]}</span>}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
          <div className="bot">
            <nav className="nav"><Link href="/" target="_blank"><i>↗</i>사이트 보기</Link></nav>
            <div className="me">
              <span className="av">{me.u.slice(0, 2).toUpperCase()}</span>
              <div>{me.u}<br /><span className="mono" style={{ fontSize: 10, color: "#777" }}>{me.r.toUpperCase()}</span></div>
              <button onClick={logout} title="로그아웃">⎋</button>
            </div>
          </div>
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
    </AdminProvider>
  );
}
