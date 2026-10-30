// 관리자 세션 쿠키 서명·검증 — Web Crypto(HMAC-SHA256)만 사용해 Edge(미들웨어)·Node(API)에서 동일하게 동작한다.
// node: 모듈을 import 하지 않는다.

function bytesToB64url(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(str) {
  const pad = (4 - (str.length % 4)) % 4;
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret) {
  return globalThis.crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
  );
}

/**
 * @param {{u: string, r: 'owner'|'editor'}} payload
 * @param {string} secret
 * @param {number} [ttlSec] 기본 12시간
 */
export async function signSession(payload, secret, ttlSec = 43200) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec };
  const encoded = bytesToB64url(new TextEncoder().encode(JSON.stringify(body)));
  const key = await hmacKey(secret);
  const sigBuf = await globalThis.crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded));
  return `${encoded}.${bytesToB64url(new Uint8Array(sigBuf))}`;
}

/**
 * 서명·만료를 검증하고 payload 를 반환한다. 실패하면 null.
 * @param {string|null|undefined} token
 * @param {string} secret
 */
export async function verifySession(token, secret) {
  if (!token || typeof token !== "string" || !secret) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const key = await hmacKey(secret);
    const ok = await globalThis.crypto.subtle.verify("HMAC", key, b64urlToBytes(sig), new TextEncoder().encode(encoded));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(encoded)));
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
