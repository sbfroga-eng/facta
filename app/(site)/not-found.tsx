import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  description: "요청하신 페이지가 존재하지 않습니다. 펙타(FACTA)의 마케팅 서비스와 인사이트를 확인해 보세요.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main>
      <section className="nf">
        <div className="wrap">
          <span className="nf-code">404</span>
          <h1>찾으시는 페이지가 없습니다</h1>
          <p>
            주소가 바뀌었거나 삭제된 페이지입니다.
            <br />
            아래에서 원하시는 곳으로 이동해 주세요.
          </p>
          <div className="nf-actions">
            <a href="/" className="btn btn-primary btn-arrow">홈으로 가기</a>
            <a href="/#services" className="btn btn-outline">서비스 살펴보기</a>
          </div>
          <div className="nf-links">
            <a href="/#services">SEO·GEO·AEO 최적화</a>
            <a href="/#process">진행 방식</a>
            <a href="/insights">마케팅 인사이트</a>
            <a href="/#contact">무료 진단 신청</a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
