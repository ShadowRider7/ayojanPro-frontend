import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyProfessionalApplicationForm from "@/components/form/verify-professional-application-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Verify your application",
  description:
    "Enter the 6-digit code we emailed you to verify your professional application.",
};

export default function VerifyProfessionalApplicationPage() {
  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense
              fallback={<Skeleton className="h-72 w-full rounded-xl" />}
            >
              <VerifyProfessionalApplicationForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/60" />
        <div className="relative flex h-full flex-col justify-end gap-3 p-10 text-primary-foreground">
          <p className="max-w-sm text-2xl font-semibold tracking-tight text-balance">
            One step away from your professional application.
          </p>
          <p className="text-sm text-primary-foreground/80">
            Verify your email and our team takes it from there — you will be
            notified as soon as your application is reviewed.
          </p>
        </div>
      </div>
    </div>
  );
}
