import type { Metadata } from "next";
import { Suspense } from "react";
import AuthAside from "@/components/auth/auth-aside";
import ForgotPasswordForm from "@/components/form/forgot-password-form";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a 6-digit reset code for your AyojanPro account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-[calc(100svh-var(--spacing-header))] lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense
              fallback={<Skeleton className="h-60 w-full rounded-xl" />}
            >
              <ForgotPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
      <AuthAside
        image="/illustrations/auth/forgot-password.svg"
        title="Locked out? We'll get you back in."
        description={`We'll email a one-time code to reset your ${APP_NAME} password.`}
      />
    </div>
  );
}
