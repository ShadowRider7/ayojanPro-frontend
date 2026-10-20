"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useGetMe } from "@/hooks";
import { DASHBOARD_ROUTES } from "@/lib/constants";
import AuthLoading from "./auth-loading";

/**
 * Sends a signed-in visitor to their dashboard.
 *
 * Without children it only performs the redirect (the login and register
 * pages). With children it also gates them: the content is only rendered
 * for a visitor who is not signed in, which keeps pages that belong to the
 * sign-up flow — the professional application — out of reach of an account
 * that already exists.
 */
export default function RedirectIfAuthenticated({
  children,
}: {
  children?: ReactNode;
}) {
  const router = useRouter();
  const { data, isPending } = useGetMe();
  const user = data?.data;

  useEffect(() => {
    if (isPending || !user) {
      return;
    }
    router.replace(DASHBOARD_ROUTES[user.role] ?? "/dashboard");
  }, [isPending, user, router]);

  if (!children) {
    return null;
  }

  if (isPending || user) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
