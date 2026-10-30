import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/server/session.mjs";
import AdminShell from "@/components/admin/AdminShell";
import "../admin.css";

export const metadata = { robots: { index: false, follow: false } };

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const token = jar.get("fx_adm")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const payload = token && secret ? await verifySession(token, secret) : null;
  if (!payload || (payload.r !== "owner" && payload.r !== "editor")) {
    redirect("/admin/login");
  }
  return <AdminShell me={{ u: payload.u as string, r: payload.r as "owner" | "editor" }}>{children}</AdminShell>;
}
