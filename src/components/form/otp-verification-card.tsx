"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import Link from "next/link";
import { useId, useState } from "react";
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

type OtpVerificationCardProps = {
  /** The address the code was sent to. */
  email: string;

  title: string;
  submitLabel: string;

  /** Shown under the input, e.g. how long the code stays valid. */
  expiryCopy: string;

  /** Where the "Use a different email" link goes. */
  fallbackHref: string;

  isPending: boolean;

  /** Called with the 6-digit code once the visitor submits a valid one. */
  onVerify: (otp: string) => void;
};

/**
 * The card both email-verification screens share: the address the code was
 * sent to, the code input and the submit button.
 */
export function OtpVerificationCard({
  email,
  title,
  submitLabel,
  expiryCopy,
  fallbackHref,
  isPending,
  onVerify,
}: OtpVerificationCardProps) {
  const formId = useId();
  const fieldId = useId();

  const [otp, setOtp] = useState("");
  const [invalidOtp, setInvalidOtp] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (!/^\d{6}$/.test(otp)) {
              setInvalidOtp(true);
              return;
            }

            onVerify(otp);
          }}
        >
          <Field data-invalid={invalidOtp}>
            <FieldLabel htmlFor={fieldId}>Verification code</FieldLabel>
            <InputOTP
              id={fieldId}
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
            {invalidOtp ? (
              <FieldError
                errors={[{ message: "Enter the full 6-digit code" }]}
              />
            ) : null}
            <FieldDescription>{expiryCopy}</FieldDescription>
          </Field>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          form={formId}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Spinner /> Verifying
            </>
          ) : (
            submitLabel
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          nativeButton={false}
          render={<Link href={fallbackHref} />}
        >
          Use a different email
        </Button>
      </CardFooter>
    </Card>
  );
}
