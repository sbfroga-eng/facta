// 이름표 있는 검색·AI 크롤러 표 — 미들웨어(Edge)에서도 쓰므로 node: 모듈을 import 하지 않는다.

/** @typedef {{bot: string, kind: 'search'|'ai_train'|'ai_search'|'ai_answer'|'other'}} BotMatch */

export const BOTS = [
  { name: "Googlebot", re: /Googlebot/i, kind: "search" },
  { name: "Google-Extended", re: /Google-Extended/i, kind: "ai_train" },
  { name: "Bingbot", re: /bingbot/i, kind: "search" },
  { name: "Yeti", re: /Yeti/i, kind: "search" },
  { name: "Daum", re: /Daum/i, kind: "search" },
  { name: "Applebot", re: /Applebot/i, kind: "search" },
  { name: "GPTBot", re: /GPTBot/i, kind: "ai_train" },
  { name: "OAI-SearchBot", re: /OAI-SearchBot/i, kind: "ai_search" },
  { name: "ChatGPT-User", re: /ChatGPT-User/i, kind: "ai_answer" },
  { name: "ClaudeBot", re: /ClaudeBot/i, kind: "ai_train" },
  { name: "Claude-User", re: /Claude-User/i, kind: "ai_answer" },
  { name: "anthropic-ai", re: /anthropic-ai/i, kind: "ai_train" },
  { name: "PerplexityBot", re: /PerplexityBot/i, kind: "ai_search" },
  { name: "Perplexity-User", re: /Perplexity-User/i, kind: "ai_answer" },
  { name: "CCBot", re: /CCBot/i, kind: "ai_train" },
  { name: "Bytespider", re: /Bytespider/i, kind: "ai_train" },
  { name: "Amazonbot", re: /Amazonbot/i, kind: "search" },
  { name: "meta-externalagent", re: /meta-externalagent/i, kind: "ai_train" },
];

/**
 * UA 문자열이 이름표 있는 봇 표와 일치하면 {bot, kind} 반환, 아니면 null.
 * 더 구체적인 이름(예: Google-Extended)이 먼저 와야 하므로 표 순서를 그대로 지킨다.
 * @param {string|null|undefined} ua
 * @returns {BotMatch|null}
 */
export function matchBot(ua) {
  const s = ua || "";
  for (const b of BOTS) {
    if (b.re.test(s)) return { bot: b.name, kind: b.kind };
  }
  return null;
}
