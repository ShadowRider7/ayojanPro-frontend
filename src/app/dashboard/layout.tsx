import type { ReactNode } from "react";
import AuthGuard from "@/components/auth/auth-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";

/**
 * Session gate for every `/dashboard/*` route. The role-specific layouts
 * nested below add their own `RoleGuard` (and the professional one gates on
 * an approved application), so the shell stays shared across roles.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
