"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useVerifyProfessionalEmail } from "@/hooks";
import type { VerifyProfessionalEmailPayload } from "@/types";

export default function VerifyProfessionalApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [otp, setOtp] = useState("");
  const [invalidOtp, setInvalidOtp] = useState(false);

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

  const handleSubmit = () => {
    if (otp.length !== 6) {
      setInvalidOtp(true);
      return;
    }

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
    <Card>
      <CardHeader>
        <CardTitle>Verify your application</CardTitle>
        <CardDescription>
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="otp-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}
        >
          <Field data-invalid={invalidOtp}>
            <FieldLabel htmlFor="otp">Verification code</FieldLabel>
            <InputOTP
              id="otp"
              name="otp"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              pattern={REGEXP_ONLY_DIGITS}
              onChange={(value) => {
                setOtp(value);
                if (invalidOtp) {
                  setInvalidOtp(false);
                }
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {invalidOtp && (
              <FieldError
                errors={[{ message: "Enter the full 6-digit code" }]}
              />
            )}
            <FieldDescription>
              The code expires 60 minutes after it was sent.
            </FieldDescription>
          </Field>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          form="otp-form"
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Spinner /> Verifying
            </>
          ) : (
            "Verify application"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          nativeButton={false}
          render={<Link href="/apply-as-professional" />}
        >
          Use a different email
        </Button>
      </CardFooter>
    </Card>
  );
}
