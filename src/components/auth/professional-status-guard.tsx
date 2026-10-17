"use client";

import { ClockIcon, ShieldXIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { EmptyState, StatusBadge } from "@/components/shared";
import { useGetMe } from "@/hooks";
import AccessDenied from "./access-denied";
import AuthLoading from "./auth-loading";

/**
 * Blocks the professional workspace until the application is `APPROVED`.
 * PENDING and REJECTED professionals are shown their status instead of the
 * workspace (REJECTED also surfaces `rejectionReason`).
 */
export default function ProfessionalStatusGuard({
  children,
}: {
  children: ReactNode;
}) {
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
      </div>
    </div>
  );
}
