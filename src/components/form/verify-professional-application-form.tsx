"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { useVerifyProfessionalEmail } from "@/hooks";
import type { VerifyProfessionalEmailPayload } from "@/types";
import { OtpVerificationCard } from "./otp-verification-card";

export default function VerifyProfessionalApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate: verify, isPending } = useVerifyProfessionalEmail();

  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    if (!email) {
      router.replace("/apply-as-professional");
    }
  }, [email, router]);

  if (!email) {
    return null;
  }

  const handleVerify = (otp: string) => {
    const payload: VerifyProfessionalEmailPayload = { email, otp };

    verify(payload, {
      onSuccess: () => {
        toast.add({
          title: "Email verified — application under review",
          description:
            'Please wait for our authority to review your application. If approved, you will receive an email with your password — sign in with it, then choose "Forgot password" in your account menu to set your own and keep your account secure.',
          type: "success",
          timeout: 10000,
        });

        router.push("/");
      },
      onError: (err) => {
        toast.add({
          title: "Verification failed",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
      },
    });
  };

  return (
    <OtpVerificationCard
      email={email}
      title="Verify your application"
      submitLabel="Verify application"
      expiryCopy="The code expires 60 minutes after it was sent."
      fallbackHref="/apply-as-professional"
      isPending={isPending}
      onVerify={handleVerify}
    />
  );
}
