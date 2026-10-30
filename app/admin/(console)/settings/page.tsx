import { parseAccounts } from "@/lib/server/pure.mjs";
import AuditLog from "@/components/admin/AuditLog";

export default function SettingsPage() {
  const accounts = parseAccounts(process.env.ADMIN_ACCOUNTS);
  const notifyEmail = process.env.NOTIFY_EMAIL || "(설정 안 됨)";

  return (
    <>
      <div className="top"><div><h1>설정 · 감사 로그</h1><div className="sub mono">facta.kr · 계정 · 보존 기간 · 개인정보</div></div></div>
      <section className="page">
        <div className="grid g2e">
          <div className="card">
            <h3>관리자 계정</h3>
            <table>
              <thead><tr><th>아이디</th><th>권한</th></tr></thead>
              <tbody>
                {accounts.map((a) => <tr key={a.id}><td className="mono">{a.id}</td><td><span className="tag">{a.role.toUpperCase()}</span></td></tr>)}
                {accounts.length === 0 && <tr><td className="empty" colSpan={2}>계정이 아직 없습니다 — 터미널에서 <code className="mono">npm run admin:hash</code> 실행 후 결과를 <code className="mono">ADMIN_ACCOUNTS</code> 환경변수에 추가하세요.</td></tr>}
              </tbody>
            </table>
            <label style={{ display: "block", fontFamily: "var(--mo)", fontSize: 10.5, color: "var(--g3)", margin: "16px 0 6px" }}>새 문의 알림 받을 메일</label>
            <div className="tools" style={{ margin: 0 }}><input value={notifyEmail} readOnly style={{ minWidth: 260 }} /></div>
            <div className="note" style={{ marginTop: 10 }}>알림 메일은 Vercel 환경변수 <b>NOTIFY_EMAIL</b>·<b>RESEND_API_KEY</b> 로 설정합니다(여기서 바로 저장하지 않음).</div>
          </div>
          <div className="card">
            <h3>보존 기간 · 개인정보</h3>
            <table><tbody>
              <tr><td>방문 이벤트 원장</td><td className="mono">180일</td></tr>
              <tr><td>AI 크롤러 기록</td><td className="mono">365일</td></tr>
              <tr><td>문의·진단 개인정보</td><td className="mono">상담 종료 후 3년(삭제는 owner 수동)</td></tr>
              <tr><td>IP 처리</td><td className="mono" style={{ fontSize: 11.5 }}>원문 미저장 · 일 단위 솔트 해시</td></tr>
            </tbody></table>
          </div>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <h3>감사 로그<span className="k">누가 · 언제 · 무엇을</span></h3>
          <AuditLog />
        </div>
      </section>
    </>
  );
}
