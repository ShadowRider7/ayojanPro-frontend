import type { ReactNode } from "react";
import ProfessionalStatusGate from "@/components/auth/professional-status-gate";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function ProfessionalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard roles={["PROFESSIONAL"]}>
      <ProfessionalStatusGate>
        <DashboardShell userRole="PROFESSIONAL">{children}</DashboardShell>
      </ProfessionalStatusGate>
    </RoleGuard>
  );
}
