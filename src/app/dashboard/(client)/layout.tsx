import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";

/**
 * Client-only area. The client owns the bare `/dashboard` pages (events,
 * profile) directly under the dashboard group, so this is a route group with
 * no URL segment of its own.
 */
export default function ClientLayout({ children }: { children: ReactNode }) {
  return <RoleGuard roles={["CLIENT"]}>{children}</RoleGuard>;
}
