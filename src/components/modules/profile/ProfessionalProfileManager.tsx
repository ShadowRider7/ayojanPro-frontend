"use client";

import { UserRoundIcon } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe } from "@/hooks";
import { ExperienceSection } from "./ExperienceSection";
import { PortfolioSection } from "./PortfolioSection";
import { ProfessionalDetailsForm } from "./ProfessionalDetailsForm";
import { ProfessionalSkillsCard } from "./ProfessionalSkillsCard";

function ProfileManagerSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export function ProfessionalProfileManager() {
  const { data, isPending, isError, error, refetch } = useGetMe();

  const user = data?.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Professional profile"
        description="Manage what clients see on your public profile."
      >
        {user?.professional ? (
          <StatusBadge status={user.professional.status} />
        ) : null}
      </PageHeader>

      {isPending ? (
        <ProfileManagerSkeleton />
      ) : isError || !user ? (
        <ErrorState
          title="Could not load your profile"
          error={error}
          onRetry={refetch}
        />
      ) : !user.professional ? (
        <EmptyState
          icon={UserRoundIcon}
          title="No professional profile found"
          description="Your account does not have a professional profile yet. Please contact support if you think this is a mistake."
        />
      ) : (
        <>
          <ProfessionalDetailsForm professional={user.professional} />
          <ProfessionalSkillsCard professionalId={user.professional.id} />
          <ExperienceSection professionalId={user.professional.id} />
          <PortfolioSection />
        </>
      )}
    </div>
  );
}
