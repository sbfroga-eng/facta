"use client";
import { useEffect, useRef } from "react";

const LINES = [
  "검색엔진 최적화 / 기술 SEO 진단 / 코어 웹 바이탈 / 렌더링 차단 리소스 제거 / 크롤 예산 배분",
  "robots.txt 규칙 / 사이트맵 제출 / canonical 절대경로 / 소프트 404 제거 / 리다이렉트 체인 정리",
  "구조화 데이터 JSON-LD / Organization 엔티티 / FAQ 스키마 / BreadcrumbList / 지식그래프 연결",
  "검색 의도 분석 / 정보형 탐색형 거래형 / 롱테일 키워드 / 검색량 대비 난이도 / SERP 피처 점유",
  "피처드 스니펫 / AI 개요 노출 / 생성형 엔진 최적화 / 인용 가능성 지표 / 청크 단위 콘텐츠 설계",
  "임베딩 유사도 / 리트리벌 품질 / 답변 엔진 최적화 / 출처 신뢰 시그널 / 브랜드 엔티티 강화",
  "네이버 플레이스 최적화 / 구글 비즈니스 프로필 / NAP 일관성 / 리뷰 평점 관리 / 지역 키워드 선점",
  "퍼포먼스 마케팅 / 매체 믹스 설계 / ROAS 개선 / CPA 절감 / CTR 최적화 / 전환율 리프트",
  "어트리뷰션 모델 / GA4 이벤트 설계 / 전환 픽셀 / 리타게팅 세그먼트 / 룩어라이크 확장",
  "입찰 전략 / 예산 배분 곡선 / A/B 소재 테스트 / 소재 피로도 관리 / 프리퀀시 캡",
  "커머스 온보딩 / 입점 심사 서류 / 통신판매업 신고 / 브랜드 권한 증빙 / 카테고리 적합도",
  "상품 등록 구조 / 옵션 속성 설계 / 썸네일 CTR / 상세페이지 전환 / 리뷰 유입 동선",
  "백링크 프로파일 / 도메인 권위 / 앵커 텍스트 분포 / 내부 링크 구조 / 링크 스팸 회피",
  "바이럴 콘텐츠 확산 / 커뮤니티 시딩 / 브랜드 언급량 / 자연 유입 전환 / 인플루언서 매칭",
  "데이터 대시보드 / 주간 리포트 / 코호트 분석 / LTV 추정 / 채널별 기여도 분해",
];

export default function NoiseWall() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const sec = host.closest("section") || host;
    const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const FONT = "10px GalmuriMono11, var(--font-pretendard), monospace";
    const NCOL = 4, GAP = 18, PAD = 18, LH = 18.5, ROWS = 64, CH = 4, STEP = 9, FPS = 30;
    const INK = "#6B6B68", BLK = "#262624", GRY = "#A8A8A4", NEO = "#FF5C00";

    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    host.appendChild(cv);
    const g = cv.getContext("2d")!;
    const src = document.createElement("canvas");
    const sg = src.getContext("2d")!;
    let dpr = 1, W = 0, H = 0, cw = 6, wide = 2;
    let colX: number[] = [], nc = 8, vis = 0, raf = 0, last = 0, on = false, booted = false;

    function hsh(i: number, j: number, k: number) {
      let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1442695041)) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    function sm(t: number) { return t * t * (3 - 2 * t); }
    function noise(x: number, y: number, z: number) {
      const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z);
      const u = sm(x - i), v = sm(y - j), w = sm(z - k);
      const L = (a: number, b: number, t: number) => a + (b - a) * t;
      return L(
        L(L(hsh(i, j, k), hsh(i + 1, j, k), u), L(hsh(i, j + 1, k), hsh(i + 1, j + 1, k), u), v),
        L(L(hsh(i, j, k + 1), hsh(i + 1, j, k + 1), u), L(hsh(i, j + 1, k + 1), hsh(i + 1, j + 1, k + 1), u), v),
        w
      );
    }
    function isWide(ch: string) {
      const c = ch.charCodeAt(0);
      return (c >= 0xac00 && c <= 0xd7a3) || (c >= 0x1100 && c <= 0x11ff) || (c >= 0x3130 && c <= 0x318f);
    }
    function layout(ci: number): string[][] {
      const rows: string[][] = [];
      let k = 0;
      while (rows.length < ROWS) {
        const words = LINES[(k * 3 + ci * 5) % LINES.length].split(" ");
        let line: string[] = [], used = 0;
        k++;
        for (const wd of words) {
          let need = 0;
          for (const q of wd) need += isWide(q) ? wide : 1;
          if (used && used + 1 + need > nc) { rows.push(line); line = []; used = 0; }
          if (used) { line.push(" "); used++; }
          for (const q of wd) { line.push(q); used += isWide(q) ? wide : 1; }
        }
        if (line.length) rows.push(line);
      }
      rows.length = ROWS;
      return rows;
    }
    function setup(): boolean {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = host!.clientWidth; H = host!.clientHeight;
      if (!W || !H) return false;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      sg.font = FONT; cw = sg.measureText("M").width || 6;
      wide = Math.max(1, Math.round(sg.measureText("가").width / cw));
      const colW = (W - PAD * 2 - GAP * (NCOL - 1)) / NCOL;
      nc = Math.max(8, Math.floor(colW / cw));
      colX = [];
      for (let c = 0; c < NCOL; c++) colX.push(PAD + c * (colW + GAP));
      src.width = Math.round(W * dpr); src.height = Math.round(ROWS * LH * dpr);
      sg.setTransform(dpr, 0, 0, dpr, 0, 0); sg.clearRect(0, 0, W, ROWS * LH);
      sg.font = FONT; sg.fillStyle = INK; sg.textBaseline = "middle";
      for (let c = 0; c < NCOL; c++) {
        layout(c).forEach((line, r) => {
          let x = 0;
          line.forEach((ch) => { if (ch !== " ") sg.fillText(ch, colX[c] + x * cw, r * LH + LH / 2); x += isWide(ch) ? wide : 1; });
        });
      }
      vis = Math.ceil(H / LH) + 1;
      return true;
    }
    function draw(now: number) {
      const d = dpr, t = now * 1.6e-4, sy = window.scrollY * 0.045;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
      const cwd = cw * d, lhd = LH * d, chw = CH * cw * d;
      for (let c = 0; c < NCOL; c++) {
        const x0 = colX[c] * d, dir = c % 2 ? -1 : 1;
        const off = (now * (0.0011 + c * 0.00023) + sy) * dir;
        const base = Math.floor(off), fr = (off - base) * lhd;
        for (let j = 0; j < vis; j++) {
          const sr = (((base + j) % ROWS) + ROWS) % ROWS, y = j * lhd - fr, yp = Math.max(0, y / (H * d));
          const dk = 0.16 + 0.84 * Math.pow(yp, 1.25);
          const mag = STEP * dk * dk;
          if (mag < 0.6) { g.drawImage(src, x0, sr * lhd, nc * cwd, lhd, x0, y, nc * cwd, lhd); continue; }
          for (let k = 0; k < nc; k += CH) {
            const a = noise(k * 0.09 + c * 7, sr * 0.11, t) * 12.566;
            const dx = Math.round(Math.cos(a) * mag), dy = Math.round(Math.sin(a) * mag * 0.55);
            const sc = Math.min(nc - CH, Math.max(0, ((k + dx) % nc + nc) % nc));
            const s2 = ((sr + dy) % ROWS + ROWS) % ROWS;
            g.drawImage(src, x0 + sc * cwd, s2 * lhd, chw, lhd, x0 + k * cwd, y, chw, lhd);
            const hb = hsh(sr, k, c);
            if (hb < dk * 0.085) {
              g.fillStyle = hb < dk * 0.006 ? NEO : hb < dk * 0.04 ? BLK : GRY;
              g.fillRect(x0 + k * cwd, y + lhd * 0.2, chw * (0.5 + hsh(k, sr, 9) * 0.9), lhd * 0.6);
            }
          }
        }
      }
      for (let i = 0; i < 10; i++) {
        const cc = (Math.random() * NCOL) | 0;
        const rx = colX[cc] * d + ((Math.random() * nc) | 0) * cwd, ry = ((Math.random() * vis) | 0) * lhd;
        g.clearRect(rx, ry, cwd, lhd);
        g.drawImage(src, colX[cc] * d + ((Math.random() * nc) | 0) * cwd, ((Math.random() * ROWS) | 0) * lhd, cwd, lhd, rx, ry, cwd, lhd);
      }
    }
    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (now - last < 1000 / FPS) return;
      last = now; draw(now);
    }
    function start() { if (!raf && on && !document.hidden && !REDUCE) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    let io: IntersectionObserver | null = null;
    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { setup(); draw(performance.now()); }, 150); }
    function onVis() { document.hidden ? stop() : start(); }

    function boot() {
      if (!setup()) return;
      draw(performance.now());
      if (REDUCE) return;
      io = new IntersectionObserver((e) => { on = e[0].isIntersecting; on ? start() : stop(); });
      io.observe(sec);
      document.addEventListener("visibilitychange", onVis);
      window.addEventListener("resize", onResize, { passive: true });
    }
    function once() { if (booted) return; booted = true; boot(); }

    let fontTimer: ReturnType<typeof setTimeout>;
    if (document.fonts?.load) {
      document.fonts.load(FONT).then(once, once);
      fontTimer = setTimeout(once, 800);
      document.fonts.ready.then(() => { if (booted && setup()) draw(performance.now()); });
    } else once();

    return () => {
      stop();
      clearTimeout(fontTimer); clearTimeout(resizeTimer);
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      cv.remove();
    };
  }, []);

  return <div className="nwall" ref={hostRef} />;
}
