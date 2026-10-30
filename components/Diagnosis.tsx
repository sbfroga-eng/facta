"use client";
import { useEffect, useRef, useState } from "react";
import { analyze, type AnalyzeResult } from "@/lib/analyze";

type DiagResult = AnalyzeResult & { diagId?: string };

const STEPS = ["페이지 크롤링", "콘텐츠 파싱", "GEO 점수 분석", "키워드 추출", "개선안 정리"];

declare global {
  interface Window {
    openDiagnosis?: () => void;
  }
}

// 무료 진단 모달 — 시안(renew.css) 톤으로 재스킨. 히어로의 [무료 마케팅 진단] 버튼이 window.openDiagnosis() 로 연다.
export default function Diagnosis() {
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [result, setResult] = useState<DiagResult | null>(null);
  const [gauge, setGauge] = useState(0);
  const [error, setError] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const kwRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const lastKw = useRef("");

  useEffect(() => {
    window.openDiagnosis = () => { reset(); setOpen(true); document.body.style.overflow = "hidden"; };
    return () => { delete window.openDiagnosis; };
  }, []);

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }
  function reset() { clearTimers(); setStepIdx(-1); setResult(null); setGauge(0); setError(""); }

  async function start(keyword: string, url: string) {
    lastKw.current = keyword;
    setResult(null); setGauge(0); setStepIdx(0); setError("");
    window.fxTrack?.("diag_run", { keyword, url });

    STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStepIdx(i + 1), (i + 1) * 650));
    });

    const ctx = typeof window !== "undefined" ? window.fxCtx?.() : undefined;
    let data: DiagResult;
    try {
      const res = await fetch("/api/geo/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, url, visitorId: ctx?.visitorId, sessionId: ctx?.sessionId, utm: ctx?.utm }),
      });
      data = res.ok ? await res.json() : analyze(keyword, url);
    } catch { data = analyze(keyword, url); }

    timers.current.push(setTimeout(() => {
      setResult(data);
      window.fxTrack?.("diag_result", { keyword, url, overall: data.overall, grade: data.grade, diagId: data.diagId });
      let cur = 0;
      const t = setInterval(() => {
        cur += 2; setGauge(Math.min(cur, data.overall));
        if (cur >= data.overall) clearInterval(t);
      }, 16);
      timers.current.push(t as unknown as ReturnType<typeof setTimeout>);
    }, STEPS.length * 650 + 150));
  }

  function close() {
    clearTimers();
    setOpen(false);
    document.body.style.overflow = "";
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kw = kwRef.current?.value.trim() || "";
    let url = urlRef.current?.value.trim() || "";
    if (!kw || !url) { setError("대표 키워드와 URL을 모두 입력해 주세요."); return; }
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    start(kw, url);
  }

  function requestExpert() {
    close();
    const diagIdInput = document.getElementById("diagnosisId") as HTMLInputElement | null;
    if (diagIdInput && result?.diagId) diagIdInput.value = result.diagId;
    const msgInput = document.getElementById("c-message") as HTMLTextAreaElement | null;
    if (msgInput && lastKw.current) msgInput.value = `GEO 무료 진단 결과에 대한 정밀 분석을 요청합니다. (대표 키워드: ${lastKw.current})`;
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  if (!open) return null;

  return (
    <div className={`dmodal${open ? " on" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="dbox" role="dialog" aria-modal="true" aria-label="무료 마케팅 진단">
        <div className="dhead">
          <div><span>FREE DIAGNOSIS</span><h3>내 브랜드 AI 최적화 진단</h3></div>
          <button className="dclose" onClick={close} aria-label="닫기">×</button>
        </div>

        {stepIdx === -1 && (
          <form onSubmit={onSubmit}>
            <div className="f"><input ref={kwRef} type="text" placeholder="대표 키워드 (예: 강남 피부과)" /></div>
            <div className="f"><input ref={urlRef} type="text" placeholder="진단할 URL (예: your-site.co.kr)" /></div>
            {error && <div className="derr">{error}</div>}
            <button type="submit" className="pill lime" style={{ width: "100%", textAlign: "center", border: 0, cursor: "pointer", marginTop: 4 }}>
              무료로 진단하기 →
            </button>
          </form>
        )}

        {stepIdx > -1 && !result && (
          <ul className="dsteps">
            {STEPS.map((s, i) => (
              <li key={s} className={stepIdx > i ? "done" : stepIdx === i ? "active" : ""}><span className="dot" />{s}</li>
            ))}
          </ul>
        )}

        {result && (
          <>
            <div className="dgauge">
              <div className="ring" style={{ background: `conic-gradient(var(--lime) ${gauge * 3.6}deg, rgba(255,255,255,.12) 0deg)` }}>
                {gauge}<span>/100</span>
              </div>
              <div className="grade">전체 등급<b>{result.grade}</b></div>
            </div>
            <div className="daxis">
              {([["콘텐츠 품질", result.axes.content], ["구조/답변형", result.axes.structure], ["권위/신뢰", result.axes.authority], ["인용 가능성", result.axes.citation]] as [string, number][]).map(([n, v]) => (
                <div className="r" key={n}><span>{n}</span><div className="bar"><i style={{ width: `${v}%` }} /></div><span className="mono">{v}</span></div>
              ))}
            </div>
            <div className="dcta">
              <p>개선 제안·점수 산출 근거·실측 검색량까지 전문가 1:1 리포트로 보내드립니다.</p>
              <button className="cb" onClick={requestExpert} data-track="diag_contact">이 결과로 상담받기 →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
