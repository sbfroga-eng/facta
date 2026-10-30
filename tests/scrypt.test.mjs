import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../lib/server/scrypt.mjs";

test("해시한 비밀번호는 검증을 통과한다", () => {
  const hash = hashPassword("correct-horse-battery-staple");
  assert.match(hash, /^scrypt\.16384\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/);
  assert.equal(verifyPassword("correct-horse-battery-staple", hash), true);
});

test("틀린 비밀번호는 거부된다", () => {
  const hash = hashPassword("correct-horse-battery-staple");
  assert.equal(verifyPassword("wrong-password", hash), false);
});

test("형식이 잘못된 해시는 거부된다", () => {
  assert.equal(verifyPassword("x", "not-a-valid-hash"), false);
  assert.equal(verifyPassword("x", "scrypt.16384.onlytwoparts"), false);
  assert.equal(verifyPassword("x", undefined), false);
  assert.equal(verifyPassword("x", ""), false);
});
