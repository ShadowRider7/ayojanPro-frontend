import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Logo from "@/assets/svg/Logo";
import VerifyAccountForm from "@/components/form/verify-account-form";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Verify your account",
  description: "Enter the 6-digit code we emailed you to verify your account.",
};

export default function VerifyAccountPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Logo className="size-6 text-primary" />
            <span>{APP_NAME}</span>
          </Link>
        </div>
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
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/60" />
        <div className="relative flex h-full flex-col justify-end gap-3 p-10 text-primary-foreground">
          <p className="max-w-sm text-2xl font-semibold tracking-tight text-balance">
            One step away from your AyojanPro account.
          </p>
          <p className="text-sm text-primary-foreground/80">
            Verify your email to start planning events and booking
            professionals.
          </p>
        </div>
      </div>
    </div>
  );
}
