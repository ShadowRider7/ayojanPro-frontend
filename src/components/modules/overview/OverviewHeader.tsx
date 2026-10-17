"use client";

import type { ReactNode } from "react";
import { PageHeader } from "@/components/shared";
import { useGetMe } from "@/hooks";

type OverviewHeaderProps = {
  /** Role-specific subtitle shown under the greeting. */
  description: ReactNode;
  /** Right-aligned actions. */
  children?: ReactNode;
};

/**
 * Greeting header shared by the three role dashboards. Reads the session from
 * the already-cached `useGetMe()` (`["user"]`, primed by `AuthGuard`) so no
 * extra request fires; falls back to a plain "Dashboard" title while the
 * session resolves.
 */
export function OverviewHeader({ description, children }: OverviewHeaderProps) {
  const { data } = useGetMe();
  const firstName = data?.data.name.trim().split(" ")[0];

  return (
    <PageHeader
      title={firstName ? `Welcome back, ${firstName}` : "Dashboard"}
      description={description}
    >
      {children}
    </PageHeader>
  );
}
