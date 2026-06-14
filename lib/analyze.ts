// FACTA GEO 진단 — 분석 로직
// 현재: 프론트/서버 공용 데모(결정적). 입력이 같으면 결과도 동일.
// 페이즈2: 아래 analyze()를 실제 크롤링 + LLM 호출로 교체하면 됩니다.

export type Keyword = { name: string; intent: string; pri: "high" | "mid" | "low"; desc: string; ai: boolean };
export type AnalyzeResult = {
  keyword: string; url: string;
  overall: number; grade: string; seconds: string;
  axes: { content: number; structure: number; authority: number; citation: number };
  keywords: Keyword[];
};

function seedRand(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function analyze(keyword: string, url: string): AnalyzeResult {
  const r = seedRand((keyword || "") + "|" + (url || ""));
  const axis = (n: number) => 12 + Math.floor(r() * n);
  const axes = { content: axis(45), structure: axis(48), authority: axis(46), citation: axis(30) };
  const overall = Math.round(axes.content * 0.3 + axes.structure * 0.25 + axes.authority * 0.25 + axes.citation * 0.2);
  const grade = overall >= 80 ? "A" : overall >= 65 ? "B" : overall >= 50 ? "C" : overall >= 35 ? "D" : "F";
  const tpl: [string, string, Keyword["pri"], string][] = [
    ["후기", "리뷰/비교", "high", "수요가 높고 후기형 콘텐츠로 유입·전환 가능성이 큽니다."],
    ["추천", "추천/탐색", "high", "탐색 의도가 강해 인용·노출 확보 시 효과가 높습니다."],
    ["가격", "가격 조사", "mid", "구매 직전 의도. 가격·비용 정보를 명확히 제시하면 전환율 상승."],
    ["비교", "비교/탐색", "mid", "경쟁 비교 콘텐츠로 신뢰도와 체류시간을 높일 수 있습니다."],
    ["잘하는 곳", "추천/탐색", "low", "경쟁이 높지만 지역·롱테일로 확장하면 노출 여지가 있습니다."],
  ];
  const keywords: Keyword[] = tpl.map(([suf, intent, pri, desc], i) => ({
    name: (keyword || "키워드") + " " + suf, intent, pri, desc, ai: i < 2,
  }));
  return { keyword, url, overall, grade, seconds: (20 + r() * 15).toFixed(1), axes, keywords };
}
