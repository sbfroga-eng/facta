import { test } from "node:test";
import assert from "node:assert/strict";
import { matchBot } from "../lib/server/bots.mjs";

test("GPTBot -> ai_train", () => {
  assert.deepEqual(matchBot("Mozilla/5.0 AppleWebKit (compatible; GPTBot/1.1; +https://openai.com/gptbot)"), { bot: "GPTBot", kind: "ai_train" });
});

test("ClaudeBot -> ai_train", () => {
  assert.deepEqual(matchBot("Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"), { bot: "ClaudeBot", kind: "ai_train" });
});

test("Yeti -> search", () => {
  assert.deepEqual(matchBot("Yeti/1.1 (+https://naver.me/bot)"), { bot: "Yeti", kind: "search" });
});

test("Googlebot -> search", () => {
  assert.deepEqual(matchBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"), { bot: "Googlebot", kind: "search" });
});

test("일반 브라우저는 null", () => {
  assert.equal(matchBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"), null);
});
