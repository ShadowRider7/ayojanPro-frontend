import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/assets/svg/Logo";
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
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="relative hidden overflow-hidden bg-primary lg:block">
          <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/60" />
          <div className="relative flex h-full flex-col justify-end gap-3 p-10 text-primary-foreground">
            <p className="max-w-sm text-2xl font-semibold tracking-tight text-balance">
              Welcome back to {APP_NAME}.
            </p>
            <p className="text-sm text-primary-foreground/80">
              Pick up where you left off — track proposals, contracts and
              bookings from one dashboard.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
