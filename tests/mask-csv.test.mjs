import { test } from "node:test";
import assert from "node:assert/strict";
import { maskName, maskContact, csvEscape, buildCsv } from "../lib/server/pure.mjs";

test("이름 가리기 — 2·3·4글자", () => {
  assert.equal(maskName("김철"), "김*");
  assert.equal(maskName("김철수"), "김*수");
  assert.equal(maskName("김철수민"), "김**민");
});

test("이름 가리기 — 1글자·빈값", () => {
  assert.equal(maskName("김"), "*");
  assert.equal(maskName(""), "");
});

test("연락처 가리기 — 휴대폰", () => {
  assert.equal(maskContact("010-1234-5678"), "010-****-5678");
});

test("연락처 가리기 — 일반전화", () => {
  assert.equal(maskContact("02-499-8508"), "02-***-8508");
});

test("연락처 가리기 — 이메일", () => {
  assert.equal(maskContact("test@example.com"), "te**@example.com");
});

test("CSV 이스케이프 — 쉼표·따옴표·줄바꿈", () => {
  assert.equal(csvEscape("a,b"), '"a,b"');
  assert.equal(csvEscape('he said "hi"'), '"he said ""hi"""');
  assert.equal(csvEscape("line1\nline2"), '"line1\nline2"');
  assert.equal(csvEscape("plain"), "plain");
});

test("CSV 빌드 — BOM 포함, 헤더+행", () => {
  const csv = buildCsv([{ label: "이름", key: "name" }, { label: "값", key: "v" }], [{ name: "가,나", v: 1 }]);
  assert.equal(csv.startsWith("﻿"), true);
  assert.equal(csv.includes('"가,나",1'), true);
});
