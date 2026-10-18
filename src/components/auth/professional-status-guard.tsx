"use client";

import { ClockIcon, ShieldXIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { EmptyState, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetMe } from "@/hooks";
import AccessDenied from "./access-denied";
import AuthLoading from "./auth-loading";

/**
 * Blocks the professional workspace until the application is `APPROVED`.
 * PENDING and REJECTED professionals are shown their status instead of the
 * workspace (REJECTED also surfaces `rejectionReason`). The blocked screen
 * offers a "Check again" refetch so a PENDING professional waiting on the
 * admin review sees the workspace unlock without reloading the page.
 */
export default function ProfessionalStatusGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const { data, isPending, isError, isRefetching, refetch } = useGetMe();

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

  const professional = user.professional;

  if (!professional) {
    return <AccessDenied />;
  }

  if (professional.status === "APPROVED") {
    return <>{children}</>;
  }

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
      </div>
    </div>
  );
}
