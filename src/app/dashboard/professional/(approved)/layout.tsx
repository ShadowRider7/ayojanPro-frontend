import type { ReactNode } from "react";
import AuthGuard from "@/components/auth/auth-guard";

/**
 * The part of the professional workspace that needs an approved account.
 *
 * Browsing events is open to every professional (see the parent layout), but
 * sending a proposal, managing services and editing the profile need the
 * application to be approved first.
 */
export default function ApprovedLayout({ children }: { children: ReactNode }) {
  return <AuthGuard requireApprovedProfessional>{children}</AuthGuard>;
}
