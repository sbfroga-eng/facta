"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Utm = { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
type QueuedEvent = { type: string; path: string; section?: string; meta?: Record<string, unknown> };
type TrackState = {
  visitorId: string; sessionId: string; utm: Utm; referrer: string;
  queue: QueuedEvent[]; flushTimer: ReturnType<typeof setTimeout> | null;
  seenSections: Set<string>; scroll50: boolean; scroll90: boolean;
  enabled: boolean; startedAt: number;
  push: (ev: QueuedEvent) => void; flush: () => void;
};

const SELF_HOST_RE = [/^facta\.kr$/i, /\.vercel\.app$/i, /^localhost(:\d+)?$/i, /^127\.0\.0\.1(:\d+)?$/];
const SESSION_IDLE_MS = 30 * 60 * 1000;
const FLUSH_DELAY_MS = 1500;

declare global {
  interface Window {
    fxTrack?: (type: string, meta?: Record<string, unknown>) => void;
    fxCtx?: () => { visitorId: string; sessionId: string; utm: Utm; referrer: string; path: string };
  }
}

function safeGet(storage: Storage, key: string): string | null {
  try { return storage.getItem(key); } catch { return null; }
}
function safeSet(storage: Storage, key: string, val: string) {
  try { storage.setItem(key, val); } catch { /* 저장 불가 — 메모리로만 동작 */ }
}

function uuid() {
  try { return crypto.randomUUID(); } catch { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
}

function getVisitorId() {
  const existing = safeGet(localStorage, "fx_vid");
  if (existing) return existing;
  const id = uuid();
  safeSet(localStorage, "fx_vid", id);
  return id;
}

function getSessionId() {
  const raw = safeGet(sessionStorage, "fx_sid");
  const now = Date.now();
  if (raw) {
    const [id, lastStr] = raw.split("|");
    const last = Number(lastStr) || 0;
    if (id && now - last < SESSION_IDLE_MS) {
      safeSet(sessionStorage, "fx_sid", `${id}|${now}`);
      return id;
    }
  }
  const id = uuid();
  safeSet(sessionStorage, "fx_sid", `${id}|${now}`);
  return id;
}

function getUtm(): Utm {
  const existing = safeGet(sessionStorage, "fx_utm");
  if (existing) {
    try { return JSON.parse(existing); } catch { /* fallthrough */ }
  }
  const sp = new URLSearchParams(window.location.search);
  const utm: Utm = {
    source: sp.get("utm_source") || undefined,
    medium: sp.get("utm_medium") || undefined,
    campaign: sp.get("utm_campaign") || undefined,
    term: sp.get("utm_term") || undefined,
    content: sp.get("utm_content") || undefined,
  };
  safeSet(sessionStorage, "fx_utm", JSON.stringify(utm));
  return utm;
}

function isSelfHost(host: string) {
  return SELF_HOST_RE.some((re) => re.test(host));
}

function sendBatch(st: TrackState, events: QueuedEvent[]) {
  if (events.length === 0) return;
  const payload = JSON.stringify({ visitorId: st.visitorId, sessionId: st.sessionId, referrer: st.referrer, utm: st.utm, events });
  try {
    const blob = new Blob([payload], { type: "application/json" });
    if (!navigator.sendBeacon || !navigator.sendBeacon("/api/track", blob)) {
      fetch("/api/track", { method: "POST", body: payload, keepalive: true }).catch(() => {});
    }
  } catch { /* 전송 실패는 무시 */ }
}

export default function Track() {
  const pathname = usePathname();
  const stateRef = useRef<TrackState | null>(null);

  useEffect(() => {
    if (stateRef.current) return;
    const enabled = typeof navigator !== "undefined" && !navigator.webdriver && !window.location.pathname.startsWith("/admin");
    const st: TrackState = {
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      utm: getUtm(),
      referrer: document.referrer || "",
      queue: [], flushTimer: null,
      seenSections: new Set(), scroll50: false, scroll90: false,
      enabled, startedAt: Date.now(),
      push(ev) {
        if (!this.enabled) return;
        safeSet(sessionStorage, "fx_sid", `${this.sessionId}|${Date.now()}`);
        this.queue.push(ev);
        if (this.flushTimer) clearTimeout(this.flushTimer);
        this.flushTimer = setTimeout(() => this.flush(), FLUSH_DELAY_MS);
      },
      flush() {
        if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null; }
        sendBatch(this, this.queue.splice(0, this.queue.length));
      },
    };
    stateRef.current = st;

    window.fxTrack = (type, meta) => st.push({ type, path: window.location.pathname, meta });
    window.fxCtx = () => ({ visitorId: st.visitorId, sessionId: st.sessionId, utm: st.utm, referrer: st.referrer, path: window.location.pathname });

    function onScroll() {
      const doc = document.documentElement;
      const pct = doc.scrollHeight <= doc.clientHeight ? 100 : (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
      if (!st.scroll50 && pct >= 50) { st.scroll50 = true; st.push({ type: "scroll_50", path: window.location.pathname }); }
      if (!st.scroll90 && pct >= 90) { st.scroll90 = true; st.push({ type: "scroll_90", path: window.location.pathname }); }
    }

    function onClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (!target) return;
      const trackEl = target.closest("[data-track]") as HTMLElement | null;
      if (trackEl) st.push({ type: "cta_click", path: window.location.pathname, meta: { label: trackEl.getAttribute("data-track") } });
      const link = target.closest("a[href]") as HTMLAnchorElement | null;
      if (link) {
        try {
          const url = new URL(link.href, window.location.href);
          if (url.host !== window.location.host && !isSelfHost(url.host)) {
            st.push({ type: "outbound", path: window.location.pathname, meta: { href: url.href } });
          }
        } catch { /* 무시 */ }
      }
    }

    let formStarted = false;
    function onInput(e: Event) {
      const target = e.target as Element | null;
      if (formStarted || !target?.closest("form")) return;
      formStarted = true;
      st.push({ type: "form_start", path: window.location.pathname });
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        if (!id || st.seenSections.has(id)) continue;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          st.seenSections.add(id);
          st.push({ type: "section_view", path: window.location.pathname, section: id });
        }
      }
    }, { threshold: [0.4] });
    document.querySelectorAll("section[id]").forEach((el) => observer.observe(el));

    function onLeave() {
      st.push({ type: "leave", path: window.location.pathname, meta: { duration_ms: Date.now() - st.startedAt } });
      st.flush();
    }
    function onVisibility() { if (document.visibilityState === "hidden") onLeave(); }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("input", onInput);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onLeave);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("input", onInput);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onLeave);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    st.push({ type: "pageview", path: pathname });
  }, [pathname]);

  return null;
}
