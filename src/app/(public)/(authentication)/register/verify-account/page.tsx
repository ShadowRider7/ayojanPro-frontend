import type { Metadata } from "next";
import { Suspense } from "react";
import AuthAside from "@/components/auth/auth-aside";
import VerifyAccountForm from "@/components/form/verify-account-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Verify your account",
  description: "Enter the 6-digit code we emailed you to verify your account.",
};

export default function VerifyAccountPage() {
  return (
    <div className="grid min-h-[calc(100svh-var(--spacing-header))] lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense
              fallback={<Skeleton className="h-72 w-full rounded-xl" />}
            >
              <VerifyAccountForm />
            </Suspense>
          </div>
        </div>
      </div>
      <AuthAside
        image="/illustrations/auth/verify-account.svg"
        title="One step away from your AyojanPro account."
        description="Verify your email to start planning events and booking professionals."
      />
    </div>
  );
}
