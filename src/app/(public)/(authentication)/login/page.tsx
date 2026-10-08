import type { Metadata } from "next";
import LoginForm from "@/components/form/login-form";
import GoogleLogin from "@/components/modules/google-login/GoogleLogin";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your AyojanPro account.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your events and contracts.
        </p>
      </div>
      <LoginForm />
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleLogin />
    </div>
  );
}
