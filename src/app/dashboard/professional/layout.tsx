import type { ReactNode } from "react";
import ProfessionalStatusGuard from "@/components/auth/professional-status-guard";
import RoleGuard from "@/components/auth/role-guard";

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
