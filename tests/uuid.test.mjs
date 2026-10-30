import { test } from "node:test";
import assert from "node:assert/strict";
import { isUuid } from "../lib/server/pure.mjs";

test("isUuid — 정상 UUID 는 통과, 이상한 값은 거부", () => {
  assert.equal(isUuid("3f2a9c1e-7b4d-4e8a-9c2f-1a2b3c4d5e6f"), true);
  assert.equal(isUuid("3F2A9C1E-7B4D-4E8A-9C2F-1A2B3C4D5E6F"), true);
  for (const bad of [undefined, null, "", "abc", "1; drop table inquiries", "3f2a9c1e7b4d4e8a9c2f1a2b3c4d5e6f", 123, {}]) {
    assert.equal(isUuid(bad), false, String(bad));
  }
});
