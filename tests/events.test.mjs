import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeEvents, referrerHost } from "../lib/server/pure.mjs";

test("허용 밖 type 은 버린다", () => {
  const out = sanitizeEvents([{ type: "pageview", path: "/" }, { type: "hack_event", path: "/" }]);
  assert.equal(out.length, 1);
  assert.equal(out[0].type, "pageview");
});

test("20개 초과는 자른다", () => {
  const events = Array.from({ length: 30 }, () => ({ type: "pageview", path: "/" }));
  const out = sanitizeEvents(events);
  assert.equal(out.length, 20);
});

test("meta 2KB 초과면 그 이벤트를 버린다", () => {
  const big = { blob: "x".repeat(3000) };
  const out = sanitizeEvents([
    { type: "cta_click", path: "/", meta: { label: "ok" } },
    { type: "cta_click", path: "/", meta: big },
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].meta.label, "ok");
});

test("자기 도메인 referrer 는 null", () => {
  assert.equal(referrerHost("https://facta.kr/some/page"), null);
  assert.equal(referrerHost("https://my-app.vercel.app/x"), null);
  assert.equal(referrerHost("http://localhost:3000/"), null);
});

test("다른 도메인 referrer 는 호스트만", () => {
  assert.equal(referrerHost("https://www.google.com/search?q=facta"), "www.google.com");
});

test("referrer 없으면 null", () => {
  assert.equal(referrerHost(""), null);
  assert.equal(referrerHost(undefined), null);
});
