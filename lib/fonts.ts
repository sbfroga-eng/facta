import localFont from "next/font/local";

// 외부 CDN 의존 제거 — public/fonts/ 에 받아둔 파일을 셀프 호스팅한다.
// Pretendard 는 next/font 로 쓰지 않는다 — 2MB 전체 파일을 모든 페이지에서 preload 했기 때문.
// 대신 public/fonts/pretendard/ 의 공식 dynamic-subset(글자 묶음별 작은 woff2)을 app/layout.tsx 에서 CSS 로 연결한다.

export const spaceGrotesk = localFont({
  src: [
    { path: "../public/fonts/SpaceGrotesk-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/SpaceGrotesk-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/SpaceGrotesk-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
});
