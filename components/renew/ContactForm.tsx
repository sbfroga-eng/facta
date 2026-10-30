"use client";
import { useState } from "react";
import { site } from "@/lib/content";

type Status = "idle" | "sending" | "ok" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [okNo, setOkNo] = useState<number | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const ctx = typeof window !== "undefined" ? window.fxCtx?.() : undefined;

    setStatus("sending"); setErrorMsg("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"), contact: data.get("contact"), brand: data.get("brand") || undefined,
          service: data.get("service") || undefined, message: data.get("message") || undefined,
          consent: data.get("consent") === "on", website: data.get("website") || "",
          diagnosisId: data.get("diagnosisId") || undefined,
          visitorId: ctx?.visitorId, sessionId: ctx?.sessionId, path: ctx?.path || window.location.pathname,
          referrer: ctx?.referrer, utm: ctx?.utm,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setStatus("error"); setErrorMsg(json.error || "접수에 실패했습니다. 잠시 후 다시 시도해 주세요."); return; }
      setStatus("ok"); setOkNo(json.no || null); form.reset();
    } catch {
      setStatus("error"); setErrorMsg("접수에 실패했습니다. 02-499-8508 로 연락 주세요.");
    }
  }

  return (
    <section className="ct" id="contact"><div className="grid" /><div className="w">
      <div className="cg">
        <div>
          <h2>LET&apos;S<br />MAKE IT.</h2>
          <div className="cr">
            <div className="r"><div className="k">TEL</div><div className="v">{site.phone}</div></div>
            <div className="r"><div className="k">MAIL</div><div className="v">{site.email}</div></div>
            <div className="r"><div className="k">OFFICE</div><div className="v">{site.address}</div></div>
          </div>
          <a href="tel:0249908508" className="cb" data-track="contact_tel">바로 문의하기 →</a>
        </div>
        <form className="fm" onSubmit={onSubmit}>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} aria-hidden="true" />
          <input type="hidden" name="diagnosisId" id="diagnosisId" />
          <div className="f"><input type="text" name="name" placeholder="성함 (필수)" required /></div>
          <div className="f"><input type="text" name="contact" placeholder="연락처 (필수)" required /></div>
          <div className="f"><input type="text" name="brand" placeholder="브랜드 · 제품명 (선택)" /></div>
          <div className="f">
            <select name="service" defaultValue="">
              <option value="">관심 서비스 (선택)</option>
              <option>SEO 검색엔진 최적화</option><option>GEO 생성형 엔진 최적화</option><option>AEO 답변 엔진 최적화</option>
              <option>LSM 로컬 검색 마케팅</option><option>퍼포먼스 마케팅</option><option>통합 마케팅 전체</option>
            </select>
          </div>
          <div className="f"><textarea id="c-message" name="message" placeholder="문의내용 (선택)" /></div>
          <div className="f" style={{ fontSize: 12.5, color: "rgba(255,255,255,.6)" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <input type="checkbox" name="consent" required style={{ width: "auto", marginTop: 3 }} />
              개인정보 수집·이용(문의 응대 목적, 상담 종료 후 3년 보관)에 동의합니다
            </label>
          </div>
          <button type="submit" className="sb" disabled={status === "sending"} data-track="contact_submit">
            {status === "sending" ? "접수 중..." : "상담 신청하기"}
          </button>
          {status === "ok" && <p className="note ok">접수되었습니다. 접수번호 Q-{okNo} · 영업일 기준 1일 이내에 연락드리겠습니다.</p>}
          {status === "error" && <p className="note err">{errorMsg}</p>}
        </form>
      </div>
      <div className="cf">
        <span className="mono" style={{ fontWeight: 700, color: "#fff" }}>FACTA</span>
        <p>(주)펙타 · 대표 {site.ceo} · 사업자등록번호 {site.bizNumber}<br />{site.address} · ©2026 FACTA</p>
      </div>
    </div></section>
  );
}
