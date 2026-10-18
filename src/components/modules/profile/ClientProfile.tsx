"use client";

import { UserRoundIcon } from "lucide-react";
import { EmptyState, ErrorState, PageHeader } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe } from "@/hooks";
import { ProfileDetailsForm } from "./ProfileDetailsForm";
import { ProfileImageCard } from "./ProfileImageCard";

function ProfileSkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl lg:col-span-2" />
    </div>
  );
}

export function ClientProfile() {
  const { data, isPending, isError, error, refetch } = useGetMe();

  const user = data?.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description="Manage your personal details and profile photo."
      />

      {isPending ? (
        <ProfileSkeleton />
      ) : isError || !user ? (
        <ErrorState
          title="Could not load your profile"
          error={error}
          onRetry={refetch}
        />
      ) : !user.client ? (
        <EmptyState
          icon={UserRoundIcon}
          title="No client profile found"
          description="Your account does not have a client profile yet. Please contact support if you think this is a mistake."
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <ProfileImageCard user={user} />
          <ProfileDetailsForm client={user.client} className="lg:col-span-2" />
        </div>
      )}
    </div>
  );
}
