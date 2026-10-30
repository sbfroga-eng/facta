import { test } from "node:test";
import assert from "node:assert/strict";
import { parseUA } from "../lib/server/pure.mjs";

const UA = {
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  ipad: "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  winChrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  macSafari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
};

test("iPhone -> mobile/Safari/iOS", () => {
  assert.deepEqual(parseUA(UA.iphone), { device: "mobile", browser: "Safari", os: "iOS" });
});

test("Android phone -> mobile/Chrome/Android", () => {
  assert.deepEqual(parseUA(UA.android), { device: "mobile", browser: "Chrome", os: "Android" });
});

test("iPad -> tablet/Safari/iOS", () => {
  assert.deepEqual(parseUA(UA.ipad), { device: "tablet", browser: "Safari", os: "iOS" });
});

test("Windows Chrome -> pc/Chrome/Windows", () => {
  assert.deepEqual(parseUA(UA.winChrome), { device: "pc", browser: "Chrome", os: "Windows" });
});

test("Mac Safari -> pc/Safari/macOS", () => {
  assert.deepEqual(parseUA(UA.macSafari), { device: "pc", browser: "Safari", os: "macOS" });
});
