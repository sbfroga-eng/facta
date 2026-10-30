"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../admin.css";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.error || "로그인에 실패했습니다.");
        setBusy(false);
        return;
      }
      const next = sp.get("next");
      router.push(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setErr("네트워크 오류가 발생했습니다.");
      setBusy(false);
    }
  }

  return (
    <div className="adm login">
      <form className="lbox" onSubmit={onSubmit}>
        <div className="brand">FACTA</div>
        <div className="t">ADMIN CONSOLE · 관리자 전용</div>
        <label htmlFor="id">아이디</label>
        <input id="id" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" required />
        <label htmlFor="pw">비밀번호</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        <button type="submit" disabled={busy}>{busy ? "확인 중..." : "로그인"}</button>
        {err && <div className="err">{err}</div>}
        <div className="n">비밀번호는 서버에서 해시 비교 · 12시간 세션 쿠키 · 10분에 5회 실패 시 잠금 · 접속 기록은 감사 로그에 남습니다.</div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
