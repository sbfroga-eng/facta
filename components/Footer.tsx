import { site } from "@/lib/content";

export default function Footer() {
  return (
    <footer><div className="wrap">
      <div className="foot-grid">
        <div className="foot-brand">
          <img src="/facta-logo-white.png" alt="FACTA" />
          <p>데이터(Fact)와 타이밍(Timing)으로 검색의 모든 접점에서 성장을 설계하는 디지털 마케팅 컴퍼니.</p>
        </div>
        <div className="foot-col"><h5>Services</h5><a href="/#services">SEO 최적화</a><a href="/#services">GEO 최적화</a><a href="/#services">LSM 로컬 마케팅</a><a href="/#services">퍼포먼스 마케팅</a></div>
        <div className="foot-col"><h5>Company</h5><a href="/#concept">브랜드 스토리</a><a href="/#process">진행 방식</a><a href="/insights">인사이트</a><a href="/#contact">문의하기</a></div>
        <div className="foot-col"><h5>Contact</h5><a href={`tel:${site.phone.replace(/-/g, "")}`}>{site.phone}</a><a href={`mailto:${site.email}`}>{site.email}</a><a href="/#contact">무료 진단 신청</a></div>
      </div>
      <div className="foot-bottom">
        <p>© 2026 FACTA. All rights reserved. · 대표 OOO · 사업자등록번호 000-00-00000</p>
        <div className="socials">
          <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>
          <a href="#" aria-label="Blog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h5" /></svg></a>
          <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" /></svg></a>
        </div>
      </div>
    </div></footer>
  );
}
