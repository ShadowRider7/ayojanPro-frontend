import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";

/** Admin-only area. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleGuard roles={["ADMIN"]}>{children}</RoleGuard>;
}
