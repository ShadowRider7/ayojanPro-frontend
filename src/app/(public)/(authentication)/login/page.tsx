import type { Metadata } from "next";
import AuthAside from "@/components/auth/auth-aside";
import RedirectIfAuthenticated from "@/components/auth/redirect-if-authenticated";
import LoginForm from "@/components/form/login-form";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to your AyojanPro account to plan events, review proposals and manage your contracts.",
};

export default function LoginPage() {
  return (
    <>
      <RedirectIfAuthenticated />
      <div className="grid min-h-[calc(100svh-var(--spacing-header))] lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
        <AuthAside
          image="/illustrations/auth/login.svg"
          title={`Welcome back to ${APP_NAME}.`}
          description="Pick up where you left off — track proposals, contracts and bookings from one dashboard."
        />
      </div>
    </>
  );
}
