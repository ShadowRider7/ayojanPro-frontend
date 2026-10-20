import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";

/**
 * The professional workspace.
 *
 * Every professional lands here, whatever the state of their application —
 * browsing the published events is open to all of them. The pages that need
 * an approved account are grouped under `(approved)`, which adds the
 * `ProfessionalStatusGuard` on top of this.
 */
export default function ProfessionalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RoleGuard roles={["PROFESSIONAL"]}>{children}</RoleGuard>;
}
