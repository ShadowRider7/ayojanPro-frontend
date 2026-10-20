"use client";

import { CalendarSearchIcon, ClockIcon, ShieldXIcon } from "lucide-react";
import Link from "next/link";
import { EmptyState, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetMe } from "@/hooks";
import type { Professional } from "@/types";

/**
 * The screen a professional sees while their application is still being
 * reviewed (or after it was rejected). It offers a way to check the status
 * again without a page reload.
 */
export default function ProfessionalPending({
  professional,
}: {
  professional: Professional;
}) {
  const { isRefetching, refetch } = useGetMe();

  const isRejected = professional.status === "REJECTED";

  return (
    <div className="flex h-screen w-full items-center justify-center px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <EmptyState
          icon={isRejected ? ShieldXIcon : ClockIcon}
          title={
            isRejected ? "Application not approved" : "Application under review"
          }
          description={
            isRejected
              ? (professional.rejectionReason ??
                "Your professional application was not approved. Please review your details and get in touch with support.")
              : "Your professional application is being reviewed. The workspace unlocks as soon as an admin approves it."
          }
        />
        <StatusBadge status={professional.status} />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            {isRefetching ? (
              <>
                <Spinner className="size-3.5" /> Checking
              </>
            ) : (
              "Check again"
            )}
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/professional/browse-events" />}
          >
            <CalendarSearchIcon /> Browse events
          </Button>
        </div>
      </div>
    </div>
  );
}
