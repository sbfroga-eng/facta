import { test } from "node:test";
import assert from "node:assert/strict";

const prevUrl = process.env.SUPABASE_URL;
const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

const { getContent } = await import("../lib/cms.ts");

test("DB 환경변수 없으면 null(호출부가 기본값으로 폴백)", async () => {
  const rows = await getContent("faq");
  assert.equal(rows, null);
});

if (prevUrl) process.env.SUPABASE_URL = prevUrl;
if (prevKey) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
