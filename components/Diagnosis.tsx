"use client";
import { useRef, useState } from "react";
import { analyze, type AnalyzeResult } from "@/lib/analyze";

const STEPS = ["페이지 크롤링", "콘텐츠 파싱", "GEO 점수 분석", "키워드 추출", "개선안 정리"];
const PRI: Record<string, string> = { high: "높음", mid: "중간", low: "낮음" };

export default function Diagnosis() {
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1); // -1: 로딩 전, STEPS.length: 완료
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [tab, setTab] = useState<"kw" | "geo">("kw");
  const [meta, setMeta] = useState("");
  const [gauge, setGauge] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const kwRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const lastKw = useRef("");

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }

  async function start(keyword: string, url: string) {
    lastKw.current = keyword;
    setMeta(`${keyword} · ${url}`);
    setResult(null); setTab("kw"); setGauge(0); setStepIdx(0); setOpen(true);
    document.body.style.overflow = "hidden";

    // 단계별 로딩 애니메이션
    STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStepIdx(i + 1), (i + 1) * 750));
    });

    // 실제 분석: API 라우트 호출 (실패 시 클라이언트 데모로 폴백)
    let data: AnalyzeResult;
    try {
      const res = await fetch("/api/geo/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, url }),
      });
      data = res.ok ? await res.json() : analyze(keyword, url);
    } catch { data = analyze(keyword, url); }

    timers.current.push(setTimeout(() => {
      setResult(data);
      // 게이지 애니메이션
      let cur = 0;
      const t = setInterval(() => {
        cur += 1; setGauge(cur);
        if (cur >= data.overall) clearInterval(t);
      }, 14);
      timers.current.push(t as unknown as ReturnType<typeof setTimeout>);
    }, STEPS.length * 750 + 200));
  }

  function close() { clearTimers(); setOpen(false); document.body.style.overflow = ""; }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kw = kwRef.current?.value.trim() || "";
    let url = urlRef.current?.value.trim() || "";
    if (!kw || !url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    start(kw, url);
  }

  function requestExpert() {
    close();
    const sel = document.getElementById("service") as HTMLSelectElement | null;
    if (sel) sel.value = "통합 마케팅 (전체)";
    const msg = document.getElementById("msg") as HTMLTextAreaElement | null;
    if (msg && lastKw.current) msg.value = `GEO 무료 진단 결과에 대한 정밀 분석을 요청합니다. (대표 키워드: ${lastKw.current})`;
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <div className="diag-card">
        <div className="diag-card-head">
          <span className="diag-free">FREE · 30초</span>
          <h3>내 브랜드 인공지능<br />최적화 진단</h3>
          <p>진단 후, 바이럴·퍼포먼스 마케팅의 방향성을 정하세요.</p>
        </div>
        <form className="diag-form" autoComplete="off" onSubmit={onSubmit}>
          <div className="diag-field">
            <label htmlFor="diagKw">대표 키워드</label>
            <input id="diagKw" ref={kwRef} type="text" placeholder="예: 강남 피부과" required />
          </div>
          <div className="diag-field">
            <label htmlFor="diagUrl">진단할 URL</label>
            <input id="diagUrl" ref={urlRef} type="text" placeholder="예: https://your-site.co.kr" required />
          </div>
          <button type="submit" className="btn btn-primary btn-arrow">무료로 진단하기</button>
        </form>
        <div className="diag-trust">ChatGPT · Gemini · Perplexity 인용 가능성 분석</div>
      </div>

      {open && (
        <div className="diag-overlay open" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="diag-dialog" role="dialog" aria-modal="true" aria-label="GEO 분석 결과">
            <div className="diag-dialog-head">
              <div className="diag-dialog-title">GEO 분석 결과 <span>{meta}</span></div>
              <button className="diag-close" aria-label="닫기" onClick={close}>✕</button>
            </div>

            {!result && (
              <div className="diag-loading">
                <span className="diag-eyebrow">ANALYZING</span>
                <h3>GEO 점수를<br />측정하고 있어요</h3>
                <p className="diag-loading-sub">입력하신 페이지를 분석해 인용 가능성·콘텐츠 품질·권위 등을 산출합니다.</p>
                <ul className="diag-steps">
                  {STEPS.map((s, i) => (
                    <li key={s} className={stepIdx > i ? "done" : stepIdx === i ? "active" : ""}>
                      <span className="dot" /><em>{s}</em>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result && (
              <div className="diag-result">
                <div className="diag-tabs">
                  <button className={`diag-tab ${tab === "kw" ? "active" : ""}`} onClick={() => setTab("kw")}><b>1</b> 키워드 선정</button>
                  <button className={`diag-tab ${tab === "geo" ? "active" : ""}`} onClick={() => setTab("geo")}><b>2</b> GEO 측정</button>
                </div>

                {tab === "kw" && (
                  <div className="diag-pane">
                    <h4 className="diag-pane-title">타겟 키워드 선정</h4>
                    <p className="diag-pane-sub">입력한 페이지와 키워드를 분석해 SEO·GEO에 적합한 타겟 키워드를 추출합니다.</p>
                    <div className="kw-table">
                      {result.keywords.map((k) => (
                        <div className="kw-row" key={k.name}>
                          <div className="kw-main">
                            <div className="kw-name">{k.name}{k.ai && <span className="kw-ai">+ AI 추천</span>}</div>
                            <div className="kw-desc">{k.desc}</div>
                          </div>
                          <div className="kw-intent">{k.intent}</div>
                          <div className={`kw-pri ${k.pri}`}>{PRI[k.pri]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "geo" && (
                  <div className="diag-pane">
                    <h4 className="diag-pane-title">GEO 측정 점수</h4>
                    <p className="diag-pane-sub">생성형 AI 검색에서 이 페이지가 인용될 가능성을 4가지 축으로 평가합니다.</p>
                    <div className="geo-score">
                      <div className="geo-gauge" style={{ background: `conic-gradient(var(--accent) ${gauge * 3.6}deg, var(--line) 0deg)` }}>
                        <span className="geo-num">{gauge}</span><span className="geo-den">/100</span>
                      </div>
                      <div className="geo-grade">
                        <span className="geo-grade-label">전체 등급</span>
                        <span className="geo-grade-val">{result.grade}</span>
                        <span className="geo-grade-time">분석 소요 {result.seconds}초</span>
                      </div>
                    </div>
                    <div className="geo-axes">
                      {([["콘텐츠 품질", result.axes.content], ["구조 / 답변형", result.axes.structure], ["권위 / 신뢰", result.axes.authority], ["인용 가능성", result.axes.citation]] as [string, number][]).map(([n, v]) => (
                        <div className="geo-axis" key={n}>
                          <div className="geo-axis-name">{n}<b>{v}/100</b></div>
                          <div className="geo-bar"><i style={{ width: `${v}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="diag-cta">
                  <div className="diag-cta-copy">
                    <span className="diag-eyebrow" style={{ color: "#ff7a45" }}>상세 분석</span>
                    <strong>개선 제안 · 점수 산출 근거 · 실측 검색량까지</strong>
                    <p>FACTA 전문가가 1:1 정밀 리포트를 보내드립니다.</p>
                  </div>
                  <button className="btn btn-primary btn-arrow" onClick={requestExpert}>전문가 분석 요청</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
