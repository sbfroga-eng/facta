// 의존성 없이 돌아가는 순수 로직 — tests/*.test.mjs 가 이 파일을 직접 import 한다.
// Edge(미들웨어)·Node(API 라우트) 양쪽에서 쓰이므로 node: 전용 모듈을 쓰지 않는다.

/** @typedef {{device: 'pc'|'mobile'|'tablet', browser: string, os: string}} UAInfo */

/**
 * User-Agent 문자열을 device/browser/os 로 분류한다. 라이브러리 없이 정규식만 사용.
 * @param {string|null|undefined} ua
 * @returns {UAInfo}
 */
export function parseUA(ua) {
  const s = ua || "";
  let device = /** @type {'pc'|'mobile'|'tablet'} */ ("pc");
  if (/ipad/i.test(s) || (/android/i.test(s) && !/mobile/i.test(s))) device = "tablet";
  else if (/iphone|ipod|android.*mobile|mobile.*android|windows phone/i.test(s)) device = "mobile";

  let browser = "Unknown";
  if (/edg\//i.test(s)) browser = "Edge";
  else if (/opr\/|opera/i.test(s)) browser = "Opera";
  else if (/crios/i.test(s)) browser = "Chrome";
  else if (/fxios/i.test(s)) browser = "Firefox";
  else if (/chrome\//i.test(s) && !/chromium/i.test(s)) browser = "Chrome";
  else if (/firefox\//i.test(s)) browser = "Firefox";
  else if (/version\/.*safari|safari\//i.test(s) && !/chrome|crios|android/i.test(s)) browser = "Safari";
  else if (/samsungbrowser/i.test(s)) browser = "Samsung Internet";

  let os = "Unknown";
  if (/iphone|ipad|ipod/i.test(s)) os = "iOS";
  else if (/android/i.test(s)) os = "Android";
  else if (/windows/i.test(s)) os = "Windows";
  else if (/mac os x|macintosh/i.test(s)) os = "macOS";
  else if (/linux/i.test(s)) os = "Linux";

  return { device, browser, os };
}

// 일반 봇/크롤러 판별(이름표 없는 것 포함) — page_events 저장 여부에만 쓴다.
export const GENERIC_BOT_RE = /bot|crawl|spider|slurp|headless/i;

/**
 * @param {string|null|undefined} ua
 */
export function isGenericBot(ua) {
  return GENERIC_BOT_RE.test(ua || "");
}

export const ALLOWED_EVENT_TYPES = new Set([
  "pageview", "section_view", "scroll_50", "scroll_90", "cta_click",
  "diag_run", "diag_result", "form_start", "form_submit", "outbound", "leave",
]);

const MAX_EVENTS = 20;
const MAX_META_BYTES = 2048;

function byteLen(str) {
  return typeof Buffer !== "undefined" ? Buffer.byteLength(str, "utf8") : new TextEncoder().encode(str).length;
}

/**
 * 수집 이벤트 배열을 정제한다: 허용 밖 type 제거 · 20개 초과 자름 · meta 2KB 초과면 그 이벤트 버림.
 * @param {any[]} events
 */
export function sanitizeEvents(events) {
  if (!Array.isArray(events)) return [];
  const out = [];
  for (const e of events) {
    if (out.length >= MAX_EVENTS) break;
    if (!e || typeof e !== "object") continue;
    if (!ALLOWED_EVENT_TYPES.has(e.type)) continue;
    if (!e.path || typeof e.path !== "string") continue;
    let meta = e.meta && typeof e.meta === "object" ? e.meta : {};
    try {
      if (byteLen(JSON.stringify(meta)) > MAX_META_BYTES) continue;
    } catch { continue; }
    out.push({ ...e, meta });
  }
  return out;
}

const SELF_HOSTS = [/^facta\.kr$/i, /\.vercel\.app$/i, /^localhost(:\d+)?$/i, /^127\.0\.0\.1(:\d+)?$/];

/**
 * referrer URL 에서 호스트만 뽑는다. 자기 도메인이면 null.
 * @param {string|null|undefined} referrer
 */
export function referrerHost(referrer) {
  if (!referrer) return null;
  try {
    const u = new URL(referrer);
    const host = u.hostname;
    if (SELF_HOSTS.some((re) => re.test(host))) return null;
    return host;
  } catch {
    return null;
  }
}

/**
 * 문의 입력 검증. 통과하면 {ok:true}, 아니면 {ok:false, error, field}.
 * @param {Record<string, any>} input
 */
export function validateInquiry(input) {
  const i = input || {};
  if (typeof i.website === "string" && i.website.trim() !== "") {
    return { ok: true, honeypot: true };
  }
  if (typeof i.name !== "string" || i.name.length < 1 || i.name.length > 60) {
    return { ok: false, error: "이름을 확인해 주세요.", field: "name" };
  }
  if (typeof i.contact !== "string" || i.contact.length < 4 || i.contact.length > 120) {
    return { ok: false, error: "연락처를 확인해 주세요.", field: "contact" };
  }
  if (i.brand != null && (typeof i.brand !== "string" || i.brand.length > 80)) {
    return { ok: false, error: "브랜드명이 너무 깁니다.", field: "brand" };
  }
  if (i.service != null && (typeof i.service !== "string" || i.service.length > 60)) {
    return { ok: false, error: "관심 서비스 값이 올바르지 않습니다.", field: "service" };
  }
  if (i.message != null && (typeof i.message !== "string" || i.message.length > 2000)) {
    return { ok: false, error: "문의 내용이 너무 깁니다.", field: "message" };
  }
  if (i.consent !== true) {
    return { ok: false, error: "개인정보 수집·이용에 동의해 주세요.", field: "consent" };
  }
  return { ok: true, honeypot: false };
}

/**
 * sha256(ip + salt + YYYY-MM-DD(KST)) 해시. 원문 IP 는 결과에 남지 않는다.
 * @param {string} ip
 * @param {string} salt
 * @param {Date} [now]
 */
export async function ipHash(ip, salt, now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.toISOString().slice(0, 10);
  const data = `${ip || ""}${salt || ""}${day}`;
  const buf = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── ADMIN 팩 ② — 권한 표 ───────────────────────────────────────
const EDITOR_ALLOWED = new Set([
  "view_inquiries", "edit_inquiries", "view_diagnoses", "edit_diagnoses", "edit_content", "view_pii",
]);
const OWNER_ONLY = new Set(["export", "settings", "audit", "delete"]);

/**
 * editor 는 문의·진단 보기/수정, 콘텐츠 수정, 개인정보 보기만 허용. owner 는 전부 허용.
 * @param {string|undefined} role
 * @param {string} action
 */
export function canAdmin(role, action) {
  if (role === "owner") return true;
  if (role === "editor") return EDITOR_ALLOWED.has(action) && !OWNER_ONLY.has(action);
  return false;
}

/**
 * ADMIN_ACCOUNTS 환경변수("id:role:hash,id2:role2:hash2") 파싱.
 * @param {string|undefined} env
 */
export function parseAccounts(env) {
  const s = (env || "").trim();
  if (!s) return [];
  const out = [];
  for (const raw of s.split(",")) {
    const entry = raw.trim();
    if (!entry) continue;
    const i1 = entry.indexOf(":");
    const i2 = entry.indexOf(":", i1 + 1);
    if (i1 < 0 || i2 < 0) continue;
    const id = entry.slice(0, i1);
    const role = entry.slice(i1 + 1, i2);
    const hash = entry.slice(i2 + 1);
    if (!id || !hash || (role !== "owner" && role !== "editor")) continue;
    out.push({ id, role, hash });
  }
  return out;
}

/**
 * 이름 가리기 — 2글자는 뒤를 가리고, 3글자 이상은 가운데를 가린다.
 * @param {string|null|undefined} name
 */
export function maskName(name) {
  const s = (name || "").trim();
  const n = s.length;
  if (n === 0) return s;
  if (n === 1) return "*";
  if (n === 2) return s[0] + "*";
  return s[0] + "*".repeat(n - 2) + s[n - 1];
}

/**
 * 연락처 가리기 — 이메일은 아이디 일부만, 전화번호는 하이픈 가운데 구간만 가린다.
 * @param {string|null|undefined} contact
 */
export function maskContact(contact) {
  const s = (contact || "").trim();
  if (!s) return s;
  if (s.includes("@")) {
    const i = s.indexOf("@");
    const local = s.slice(0, i);
    const domain = s.slice(i + 1);
    const visible = local.slice(0, Math.min(2, local.length));
    const hiddenLen = Math.max(1, local.length - visible.length);
    return `${visible}${"*".repeat(hiddenLen)}@${domain}`;
  }
  const parts = s.split("-");
  if (parts.length >= 3) {
    const mid = parts.slice(1, -1).map((p) => "*".repeat(p.length || 1));
    return [parts[0], ...mid, parts[parts.length - 1]].join("-");
  }
  if (parts.length === 2) {
    return `${parts[0]}-${"*".repeat(parts[1].length)}`;
  }
  if (/^\d+$/.test(s) && s.length > 7) {
    return s.slice(0, 3) + "*".repeat(s.length - 7) + s.slice(-4);
  }
  return s;
}

/** /admin, /admin/x, /api/admin/y 는 보호 대상(미들웨어가 테스트 가능하게 분리). */
export function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

/** 로그인 자체는 보호에서 예외. */
export function isAdminLoginPath(pathname) {
  return pathname === "/admin/login" || pathname === "/api/admin/login";
}

/** CSV 필드 이스케이프 — 쉼표·따옴표·줄바꿈 포함 시 따옴표로 감싸고 내부 따옴표는 두 번. */
export function csvEscape(value) {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/**
 * columns: [{label, key}] 또는 [{label, value: (row)=>string}]. BOM 포함, CRLF 줄바꿈.
 * @param {{label: string, key?: string, value?: (row: any)=>unknown}[]} columns
 * @param {any[]} rows
 */
export function buildCsv(columns, rows) {
  const header = columns.map((c) => csvEscape(c.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => csvEscape(typeof c.value === "function" ? c.value(row) : row[c.key])).join(",")
  );
  return "﻿" + [header, ...lines].join("\r\n");
}


/** UUID(8-4-4-4-12 16진수) 형식인지. 문의의 diagnosisId 등 클라이언트가 보낸 id 검증용. */
export function isUuid(v) {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
