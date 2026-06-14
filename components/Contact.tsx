"use client";
import Reveal from "./Reveal";
import { site } from "@/lib/content";

export default function Contact() {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("문의가 접수되었습니다. 영업일 기준 1일 이내에 연락드리겠습니다. (데모 — 실제 전송은 백엔드/폼 연동이 필요합니다)");
    e.currentTarget.reset();
  }
  return (
    <section className="block" id="contact"><div className="wrap contact-grid">
      <Reveal className="contact-info">
        <span className="eyebrow">Contact</span>
        <h2>성장의 시작,<br />FACTA와 이야기 나눠요</h2>
        <p>프로젝트 규모와 관계없이 환영합니다. 영업일 기준 1일 이내에 답변드립니다.</p>
        <div className="contact-list">
          <div className="row"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg></div><div><div className="k">전화</div><div className="v">{site.phone}</div></div></div>
          <div className="row"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></svg></div><div><div className="k">이메일</div><div className="v">{site.email}</div></div></div>
          <div className="row"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg></div><div><div className="k">오피스</div><div className="v">{site.address}</div></div></div>
        </div>
      </Reveal>
      <Reveal>
        <form className="form" onSubmit={onSubmit}>
          <div className="field"><label htmlFor="name">이름 / 회사명</label><input id="name" type="text" placeholder="홍길동 / FACTA 주식회사" required /></div>
          <div className="field"><label htmlFor="cf">연락처 또는 이메일</label><input id="cf" type="text" placeholder="010-0000-0000 / you@email.com" required /></div>
          <div className="field"><label htmlFor="service">관심 서비스</label>
            <select id="service" defaultValue="SEO 검색엔진 최적화">
              <option>SEO 검색엔진 최적화</option><option>GEO 생성형 엔진 최적화</option><option>LSM 로컬 검색 마케팅</option><option>퍼포먼스 마케팅</option><option>통합 마케팅 (전체)</option>
            </select>
          </div>
          <div className="field"><label htmlFor="msg">문의 내용</label><textarea id="msg" placeholder="현재 고민하고 계신 마케팅 과제를 알려주세요." /></div>
          <button type="submit" className="btn btn-primary btn-arrow">무료 진단 신청하기</button>
          <p className="note">제출 시 개인정보 수집·이용에 동의하는 것으로 간주됩니다.</p>
        </form>
      </Reveal>
    </div></section>
  );
}
