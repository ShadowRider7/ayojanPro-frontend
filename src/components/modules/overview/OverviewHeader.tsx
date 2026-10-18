"use client";

import type { ReactNode } from "react";
import { PageHeader } from "@/components/shared";
import { useGetMe } from "@/hooks";

type OverviewHeaderProps = {
  description: ReactNode;

  children?: ReactNode;
};

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
