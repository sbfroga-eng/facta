import { test } from "node:test";
import assert from "node:assert/strict";
import { canAdmin, parseAccounts, isAdminPath, isAdminLoginPath } from "../lib/server/pure.mjs";

test("owner 는 전부 허용", () => {
  for (const a of ["view_inquiries", "edit_content", "export", "settings", "audit", "delete"]) {
    assert.equal(canAdmin("owner", a), true);
  }
});

test("editor 는 export·settings·delete 가 막힌다", () => {
  assert.equal(canAdmin("editor", "export"), false);
  assert.equal(canAdmin("editor", "settings"), false);
  assert.equal(canAdmin("editor", "delete"), false);
  assert.equal(canAdmin("editor", "audit"), false);
});

test("editor 는 문의·진단·콘텐츠는 허용", () => {
  assert.equal(canAdmin("editor", "view_inquiries"), true);
  assert.equal(canAdmin("editor", "edit_diagnoses"), true);
  assert.equal(canAdmin("editor", "edit_content"), true);
});

test("ADMIN_ACCOUNTS 파싱", () => {
  const accounts = parseAccounts("admin:owner:scrypt$16384$abc$def,sales:editor:scrypt$16384$ghi$jkl");
  assert.equal(accounts.length, 2);
  assert.deepEqual(accounts[0], { id: "admin", role: "owner", hash: "scrypt$16384$abc$def" });
  assert.deepEqual(accounts[1], { id: "sales", role: "editor", hash: "scrypt$16384$ghi$jkl" });
});

test("ADMIN_ACCOUNTS 빈 값은 빈 배열", () => {
  assert.deepEqual(parseAccounts(""), []);
  assert.deepEqual(parseAccounts(undefined), []);
});

test("미들웨어 경로 판정 — 보호 대상", () => {
  assert.equal(isAdminPath("/admin"), true);
  assert.equal(isAdminPath("/admin/inquiries"), true);
  assert.equal(isAdminPath("/api/admin/stats"), true);
});

test("미들웨어 경로 판정 — 공개 경로 통과", () => {
  assert.equal(isAdminPath("/"), false);
  assert.equal(isAdminPath("/api/track"), false);
  assert.equal(isAdminPath("/admin2"), false);
});

test("로그인 경로는 예외", () => {
  assert.equal(isAdminLoginPath("/admin/login"), true);
  assert.equal(isAdminLoginPath("/api/admin/login"), true);
  assert.equal(isAdminLoginPath("/admin"), false);
});
