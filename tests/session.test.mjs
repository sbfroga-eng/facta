import { test } from "node:test";
import assert from "node:assert/strict";
import { signSession, verifySession } from "../lib/server/session.mjs";

const SECRET = "test-secret-please-ignore";

test("서명 후 검증하면 같은 payload 를 돌려준다", async () => {
  const token = await signSession({ u: "admin", r: "owner" }, SECRET);
  const payload = await verifySession(token, SECRET);
  assert.equal(payload.u, "admin");
  assert.equal(payload.r, "owner");
  assert.equal(typeof payload.exp, "number");
});

test("변조된 토큰은 거부된다", async () => {
  const token = await signSession({ u: "admin", r: "owner" }, SECRET);
  const tampered = token.slice(0, -2) + "xx";
  assert.equal(await verifySession(tampered, SECRET), null);
});

test("다른 비밀로 검증하면 거부된다", async () => {
  const token = await signSession({ u: "admin", r: "owner" }, SECRET);
  assert.equal(await verifySession(token, "wrong-secret"), null);
});

test("만료된 토큰은 거부된다", async () => {
  const token = await signSession({ u: "admin", r: "owner" }, SECRET, -10);
  assert.equal(await verifySession(token, SECRET), null);
});

test("형식이 아예 다른 토큰은 거부된다", async () => {
  assert.equal(await verifySession("not-a-token", SECRET), null);
  assert.equal(await verifySession(null, SECRET), null);
  assert.equal(await verifySession("", SECRET), null);
});
