"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@/hooks";
import AuthLoading from "./auth-loading";

export default function ProfessionalStatusGate({
  children,
}: {
  children: ReactNode;
}) {
  const { data, isPending } = useGetMe();

  if (isPending) {
    return <AuthLoading />;
  }

  const professional = data?.data.professional;
  const status = professional?.status ?? "PENDING";

  if (status === "APPROVED") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      {status === "REJECTED" ? (
        <>
          <span className="font-heading text-4xl font-semibold text-destructive">
            Application rejected
          </span>
          <p className="max-w-md text-sm text-muted-foreground">
            {professional?.rejectionReason ??
              "Your professional application was rejected. You can re-apply with updated details."}
          </p>
        </>
      ) : (
        <>
          <span className="font-heading text-4xl font-semibold">
            Pending review
          </span>
          <p className="max-w-md text-sm text-muted-foreground">
            Your professional application is under review. You will get access
            to the dashboard once an admin approves your account.
          </p>
        </>
      )}
      <Button
        variant="outline"
        render={<Link href="/">Back to home</Link>}
        nativeButton={false}
      >
        Back to home
      </Button>
    </div>
  );
}
