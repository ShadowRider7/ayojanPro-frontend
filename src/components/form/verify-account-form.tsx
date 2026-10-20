"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { useVerifyAccount } from "@/hooks";
import type { VerifyAccountPayload } from "@/types";
import { OtpVerificationCard } from "./otp-verification-card";

export default function VerifyAccountForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const { mutate: verify, isPending } = useVerifyAccount();

  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    if (!email) {
      router.replace("/register");
    }
  }, [email, router]);

  if (!email) {
    return null;
  }

  const handleVerify = (otp: string) => {
    const payload: VerifyAccountPayload = { email, otp };

    verify(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user"] });

        toast.add({
          title: "Email verified",
          description: "Welcome to AyojanPro",
          type: "success",
        });

        router.push("/dashboard");
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
      title="Verify your account"
      submitLabel="Verify account"
      expiryCopy="The code expires 5 minutes after it was sent."
      fallbackHref="/register"
      isPending={isPending}
      onVerify={handleVerify}
    />
  );
}
