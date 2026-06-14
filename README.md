# FACTA — Next.js + 헤드리스 CMS 통합 사이트

데이터(Fact)와 타이밍(Timing)으로 검색의 모든 접점을 설계하는 FACTA 마케팅 컴퍼니 공식 사이트.
**Next.js(App Router) + AEO 풀세팅 + GEO 진단 기능 + Sanity 헤드리스 CMS(인사이트)** 구성.

## 기술 스택
- Next.js 15 (App Router, SSR/SSG) · React 19 · TypeScript
- 디자인: 커스텀 CSS(`app/globals.css`) · Pretendard 폰트
- 헤드리스 CMS: Sanity (HTTP API 직접 호출, 미연결 시 로컬 샘플로 자동 폴백)

## 빠른 시작
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
npm start        # 빌드 결과 실행
```

## AEO/GEO 최적화 (LLM 인용 대응)
- 서버사이드 렌더링(SSR/SSG)로 AI 크롤러가 본문을 그대로 읽음
- JSON-LD 구조화 데이터: Organization · WebSite · FAQPage(홈) · Article(인사이트 글)
- `app/robots.ts`, `app/sitemap.ts` 자동 생성, `public/llms.txt` 제공
- `<head>` 메타데이터·OpenGraph·canonical 설정

## GEO 진단 기능
- 히어로의 "내 브랜드 인공지능 최적화 진단" 카드 → 모달(키워드 선정 + GEO 측정)
- 프론트: `components/Diagnosis.tsx`
- API: `app/api/geo/analyze/route.ts` (POST {keyword,url})
- 분석 로직: `lib/analyze.ts` — **현재는 데모(결정적 시뮬레이션)**
- 페이즈2: `route.ts`와 `analyze()`를 실제 URL 크롤링 + LLM 채점으로 교체하면 실제 분석으로 전환

## Sanity(인사이트 블로그) 연결
1. sanity.io에서 프로젝트 생성, `post` 타입 정의(slug, title, category, excerpt, publishedAt, author, body)
2. `.env.local`에 `NEXT_PUBLIC_SANITY_PROJECT_ID` 등 설정(`.env.local.example` 참고)
3. 미설정 시 `lib/content.ts`의 샘플 글로 자동 폴백되어 빌드/실행에 지장 없음

## 배포 (Vercel 권장)
1. GitHub 저장소에 푸시
2. vercel.com에서 Import → 자동으로 `npm install && next build`
3. 환경변수(`.env.local.example` 항목) 입력 → 배포 완료
   - 또는 CLI: `npm i -g vercel && vercel`

## 구조
```
app/            라우트(layout, page, api, insights, robots, sitemap)
components/      UI 컴포넌트(Header, Hero, Diagnosis, Sections ...)
lib/            analyze(진단) · content(데이터) · sanity(CMS)
public/         로고, llms.txt
```
