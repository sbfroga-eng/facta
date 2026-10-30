import { test } from "node:test";
import assert from "node:assert/strict";
import { validateInquiry } from "../lib/server/pure.mjs";

const base = { name: "홍길동", contact: "010-1234-5678", consent: true };

test("정상 입력은 통과", () => {
  assert.equal(validateInquiry(base).ok, true);
});

test("허니팟(website) 값이 있으면 honeypot:true, 검증은 건너뜀", () => {
  const r = validateInquiry({ website: "spam" });
  assert.equal(r.ok, true);
  assert.equal(r.honeypot, true);
});

test("이름이 비었으면 거부", () => {
  const r = validateInquiry({ ...base, name: "" });
  assert.equal(r.ok, false);
  assert.equal(r.field, "name");
});

test("이름이 60자 초과면 거부", () => {
  const r = validateInquiry({ ...base, name: "가".repeat(61) });
  assert.equal(r.ok, false);
  assert.equal(r.field, "name");
});

test("연락처가 4자 미만이면 거부", () => {
  const r = validateInquiry({ ...base, contact: "010" });
  assert.equal(r.ok, false);
  assert.equal(r.field, "contact");
});

test("consent 누락이면 거부", () => {
  const r = validateInquiry({ name: "홍길동", contact: "010-1234-5678" });
  assert.equal(r.ok, false);
  assert.equal(r.field, "consent");
});

test("message 2000자 초과면 거부", () => {
  const r = validateInquiry({ ...base, message: "a".repeat(2001) });
  assert.equal(r.ok, false);
  assert.equal(r.field, "message");
});
