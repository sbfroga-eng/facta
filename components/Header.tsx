"use client";
import { useEffect, useState } from "react";

const links = [
  ["#services", "서비스"], ["#concept", "브랜드"], ["#process", "진행방식"],
  ["#results", "성과"], ["/insights", "인사이트"], ["#contact", "문의"],
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <header className={scrolled ? "scrolled" : ""}>
        <div className="wrap nav">
          <a href="/#top" className="logo" aria-label="FACTA 홈">
            <img className="l-white" src="/facta-logo-white.png" alt="FACTA" />
            <img className="l-black" src="/facta-logo-black.png" alt="FACTA" />
          </a>
          <nav className="nav-links">
            {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="nav-cta">
            <a href="/#contact" className="btn btn-primary btn-arrow">무료 진단 신청</a>
            <button className={`hamburger ${open ? "active" : ""}`} aria-label="메뉴" onClick={() => setOpen(!open)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        {links.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a href="/#contact" className="btn btn-primary" onClick={() => setOpen(false)}>무료 진단 신청</a>
      </div>
    </>
  );
}
