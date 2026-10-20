"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useGetMe } from "@/hooks";
import type { Role } from "@/types";
import AccessDenied from "./access-denied";
import AuthLoading from "./auth-loading";
import ProfessionalPending from "./professional-pending";

type AuthGuardProps = {
  children: ReactNode;

  /**
   * When given, only these roles may see the content. Everyone else gets the
   * "no access" screen.
   */
  roles?: Role[];

  /**
   * Require an APPROVED professional application. A professional whose
   * application is still pending (or rejected) sees the status screen instead
   * of the content.
   */
  requireApprovedProfessional?: boolean;
};

/**
 * The single guard for every protected area of the app.
 *
 * It owns the three rules the dashboard needs, in one place:
 *   1. no session  → redirect to the login page,
 *   2. wrong role  → "no access",
 *   3. professional application not approved → the status screen.
 */
export default function AuthGuard({
  children,
  roles,
  requireApprovedProfessional = false,
}: AuthGuardProps) {
  const router = useRouter();

  const { data, isPending, isError } = useGetMe();

  const user = data?.data;

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (isError || !user) {
      router.replace("/login");
    }
  }, [isPending, isError, user, router]);

  if (isPending) {
    return <AuthLoading />;
  }

  if (isError || !user) {
    return <AuthLoading label="Redirecting..." />;
  }

  if (roles && !roles.includes(user.role)) {
    return <AccessDenied />;
  }

  if (requireApprovedProfessional) {
    if (!user.professional) {
      return <AccessDenied />;
    }

    if (user.professional.status !== "APPROVED") {
      return <ProfessionalPending professional={user.professional} />;
    }
  }

  return <>{children}</>;
}
