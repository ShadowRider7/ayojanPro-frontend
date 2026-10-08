import type { Metadata } from "next";
import VerifyAccountForm from "@/components/form/verify-account-form";

export const metadata: Metadata = {
  title: "Verify professional account",
  description: "Verify your AyojanPro professional application.",
};

export default async function ApplyVerifyAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Verify your application
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code we sent to your email.
        </p>
      </div>
      <VerifyAccountForm email={email} purpose="professional" />
    </div>
  );
}
