import type { Metadata } from "next";
import ResetPasswordForm from "@/components/form/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password for your AyojanPro account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Set a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Use the code we emailed you along with your new password.
        </p>
      </div>
      <ResetPasswordForm email={email} />
    </div>
  );
}
