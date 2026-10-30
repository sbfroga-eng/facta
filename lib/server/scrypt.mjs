// 관리자 비밀번호 해시 — node:crypto scrypt. Edge(미들웨어)에서는 절대 import 하지 않는다.
// 구분자는 "." 를 쓴다("$" 를 쓰면 Next.js 가 .env 를 읽을 때 $VAR 변수 치환으로 오인해 값이 깨진다).
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const N = 16384, r = 8, p = 1, KEYLEN = 64;

/** @param {string} password */
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N, r, p });
  return `scrypt.${N}.${salt.toString("base64")}.${hash.toString("base64")}`;
}

/**
 * @param {string} password
 * @param {string|undefined} formatted "scrypt.N.saltB64.hashB64"
 */
export function verifyPassword(password, formatted) {
  if (!formatted || typeof formatted !== "string") return false;
  const parts = formatted.split(".");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;
  const n = Number(parts[1]);
  if (!Number.isFinite(n) || n <= 0) return false;
  let salt, expected;
  try {
    salt = Buffer.from(parts[2], "base64");
    expected = Buffer.from(parts[3], "base64");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;
  const actual = scryptSync(password, salt, expected.length, { N: n, r, p });
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
