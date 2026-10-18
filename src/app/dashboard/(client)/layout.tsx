import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <RoleGuard roles={["CLIENT"]}>{children}</RoleGuard>;
}
