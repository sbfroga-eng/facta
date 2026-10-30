export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAdminSession, audit, noStore } from "@/lib/server/adminGuard";
import { ipHash } from "@/lib/server/ctx";

export async function POST(req: Request) {
  const session = await getAdminSession(req);
  if (session) {
    const ip_hash = await ipHash(req);
    await audit(session.u, "logout", null, {}, ip_hash);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("fx_adm", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return noStore(res);
}
