#!/usr/bin/env node
// node scripts/admin-hash.mjs 실행 → 아이디·권한·비밀번호(두 번) 입력 → "id:role:scrypt해시" 한 줄 출력.
// 출력된 줄을 ADMIN_ACCOUNTS 에 쉼표로 이어 붙이면 됩니다.
import readline from "node:readline";
import { hashPassword } from "../lib/server/scrypt.mjs";

function ask(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(promptText, (answer) => { rl.close(); resolve(answer); });
  });
}

function askHidden(promptText) {
  return new Promise((resolve) => {
    process.stdout.write(promptText);
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      const rl = readline.createInterface({ input: stdin });
      rl.question("", (answer) => { rl.close(); resolve(answer); });
      return;
    }
    let input = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    function onData(char) {
      if (char === "\u0003") { stdin.setRawMode(false); process.stdout.write("\n"); process.exit(1); }
      if (char === "\r" || char === "\n") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(input);
        return;
      }
      if (char === "\u007f" || char === "\b") { input = input.slice(0, -1); return; }
      input += char;
    }
    stdin.on("data", onData);
  });
}

async function main() {
  const id = (await ask("아이디: ")).trim();
  if (!id) { console.error("아이디를 입력해 주세요."); process.exit(1); }
  // 한/영 키가 한글 상태면 owner→"ㅐ주ㄷㄱ", editor→"ㄷ얏ㅐㄱ" 로 들어온다 — 그것도 받아준다.
  const ROLES = { "": "owner", o: "owner", owner: "owner", "ㅐ주ㄷㄱ": "owner", e: "editor", editor: "editor", "ㄷ얏ㅐㄱ": "editor" };
  let role;
  for (;;) {
    const raw = (await ask("권한(owner/editor) [Enter = owner]: ")).trim().toLowerCase();
    role = ROLES[raw];
    if (role) break;
    console.error(`"${raw}" 은(는) 알 수 없는 권한입니다. owner 또는 editor 를 영문으로 입력하거나 Enter 를 누르세요.`);
  }
  console.log(`권한: ${role}`);
  const pw1 = await askHidden("비밀번호: ");
  const pw2 = await askHidden("비밀번호 확인: ");
  if (pw1 !== pw2) {
    console.error("두 비밀번호가 다릅니다. 다시 실행해 주세요.");
    process.exit(1);
  }
  if (pw1.length < 8) {
    console.error("경고: 비밀번호가 8자 미만입니다. 더 긴 비밀번호를 권장합니다.");
  }
  const hash = hashPassword(pw1);
  const line = `${id}:${role}:${hash}`;
  console.log("\n아래 줄을 ADMIN_ACCOUNTS 환경변수에 쉼표로 이어 붙이세요(계정 여러 개면 콤마로 구분):\n");
  console.log(line);
  console.log("");
}

main();
