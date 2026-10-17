import type { ReactNode } from "react";
import ProfessionalStatusGuard from "@/components/auth/professional-status-guard";
import RoleGuard from "@/components/auth/role-guard";

/**
 * Professional workspace. Requires the `PROFESSIONAL` role, then an approved
 * application — pending and rejected professionals are shown their status
 * instead of the workspace.
 */
export default function ProfessionalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard roles={["PROFESSIONAL"]}>
      <ProfessionalStatusGuard>{children}</ProfessionalStatusGuard>
    </RoleGuard>
  );
}
