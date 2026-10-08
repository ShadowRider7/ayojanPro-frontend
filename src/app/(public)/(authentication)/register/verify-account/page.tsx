import type { Metadata } from "next";
import VerifyAccountForm from "@/components/form/verify-account-form";

export const metadata: Metadata = {
  title: "Verify account",
  description: "Verify your AyojanPro account with the code we emailed you.",
};

export default async function VerifyAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Verify your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code we sent to your email.
        </p>
      </div>
      <VerifyAccountForm email={email} purpose="client" />
    </div>
  );
}
