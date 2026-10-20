import type { Metadata } from "next";
import RedirectIfAuthenticated from "@/components/auth/redirect-if-authenticated";
import { RegisterForm } from "@/components/form/register-form";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create an AyojanPro client account to plan events, request proposals and book verified professionals.",
};

export default function RegisterPage() {
  return (
    <>
      <RedirectIfAuthenticated />
      <div className="grid min-h-[calc(100svh-var(--spacing-header))] lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <RegisterForm />
            </div>
          </div>
        </div>
        <div className="relative hidden overflow-hidden bg-primary lg:block">
          <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/60" />
          <div className="relative flex h-full flex-col justify-end gap-3 p-10 text-primary-foreground">
            <p className="max-w-sm text-2xl font-semibold tracking-tight text-balance">
              Plan your event and book trusted professionals in one place.
            </p>
            <p className="text-sm text-primary-foreground/80">
              Compare proposals, manage contracts and keep every booking on
              schedule with {APP_NAME}.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
