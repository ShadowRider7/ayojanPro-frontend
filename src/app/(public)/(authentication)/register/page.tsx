import type { Metadata } from "next";
import AuthAside from "@/components/auth/auth-aside";
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
        <AuthAside
          image="/illustrations/auth/register.svg"
          title="Plan your event and book trusted professionals in one place."
          description={`Compare proposals, manage contracts and keep every booking on schedule with ${APP_NAME}.`}
        />
      </div>
    </>
  );
}
