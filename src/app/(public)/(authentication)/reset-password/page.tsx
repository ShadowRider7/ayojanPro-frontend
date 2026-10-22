import type { Metadata } from "next";
import { Suspense } from "react";
import AuthAside from "@/components/auth/auth-aside";
import ResetPasswordForm from "@/components/form/reset-password-form";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Enter your reset code and choose a new AyojanPro password.",
};

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-[calc(100svh-var(--spacing-header))] lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense
              fallback={<Skeleton className="h-80 w-full rounded-xl" />}
            >
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
      <AuthAside
        image="/illustrations/auth/reset-password.svg"
        title={`Secure your ${APP_NAME} account.`}
        description="Choose a strong password you don't use anywhere else."
      />
    </div>
  );
}
