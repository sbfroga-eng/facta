import { test } from "node:test";
import assert from "node:assert/strict";
import { ipHash } from "../lib/server/pure.mjs";

const IP = "203.0.113.42";
const SALT = "s".repeat(32);

test("같은 날 같은 IP·솔트면 같은 해시", async () => {
  const d1 = new Date("2026-01-01T03:00:00Z");
  const d2 = new Date("2026-01-01T10:00:00Z");
  const h1 = await ipHash(IP, SALT, d1);
  const h2 = await ipHash(IP, SALT, d2);
  assert.equal(h1, h2);
});

test("날짜가 바뀌면 다른 해시", async () => {
  const d1 = new Date("2026-01-01T10:00:00Z");
  const d2 = new Date("2026-01-02T10:00:00Z");
  const h1 = await ipHash(IP, SALT, d1);
  const h2 = await ipHash(IP, SALT, d2);
  assert.notEqual(h1, h2);
});

test("결과에 원문 IP가 포함되지 않는다", async () => {
  const h = await ipHash(IP, SALT, new Date());
  assert.equal(h.includes(IP), false);
  assert.match(h, /^[0-9a-f]{64}$/);
});
