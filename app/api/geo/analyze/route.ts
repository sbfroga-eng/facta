import { NextResponse } from "next/server";
import { analyze } from "@/lib/analyze";

// POST /api/geo/analyze  { keyword, url }
// 현재: 데모 분석 반환.
// 페이즈2: 여기서 (1) url 크롤링 (2) LLM 채점 (3) 키워드 생성 후 동일 형태로 반환.
export async function POST(req: Request) {
  try {
    const { keyword, url } = await req.json();
    if (!keyword || !url) return NextResponse.json({ error: "keyword와 url이 필요합니다." }, { status: 400 });
    const result = analyze(String(keyword), String(url));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
