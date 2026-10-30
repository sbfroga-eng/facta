"use client";
import { createContext, useContext } from "react";

export type AdminMe = { u: string; r: "owner" | "editor" };

const AdminContext = createContext<AdminMe>({ u: "", r: "editor" });

export function AdminProvider({ me, children }: { me: AdminMe; children: React.ReactNode }) {
  return <AdminContext.Provider value={me}>{children}</AdminContext.Provider>;
}

export function useAdminMe(): AdminMe {
  return useContext(AdminContext);
}
