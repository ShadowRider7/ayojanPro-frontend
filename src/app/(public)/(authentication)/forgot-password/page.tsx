import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/form/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your AyojanPro account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Forgot your password?
        </h1>
        <p className="text-sm text-muted-foreground">
          We will email you a code to reset it.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
