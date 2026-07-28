/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel 서버리스 번들에 OG 이미지용 한글 폰트를 포함시킨다.
  // 없으면 opengraph-image 라우트에서 폰트 파일을 찾지 못해 500이 난다.
  outputFileTracingIncludes: {
    "/insights/[slug]/opengraph-image": ["./assets/**"],
  },
};
export default nextConfig;
