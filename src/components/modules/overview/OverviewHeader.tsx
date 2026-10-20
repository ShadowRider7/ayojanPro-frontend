"use client";

import { PageHeader } from "@/components/shared";
import { useGetMe } from "@/hooks";

type OverviewHeaderProps = {
  description: React.ReactNode;
};

export function OverviewHeader({ description }: OverviewHeaderProps) {
  const { data } = useGetMe();
  const firstName = data?.data?.name.trim().split(" ")[0];

  return (
    <PageHeader
      title={firstName ? `Welcome back, ${firstName}` : "Dashboard"}
      description={description}
    />
  );
}
