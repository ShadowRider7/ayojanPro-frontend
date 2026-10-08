"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useVerifyAccount, useVerifyProfessionalAccount } from "@/hooks";
import { errorMessage } from "@/lib/utils";
import { verifyOtpSchema } from "@/validation";

interface VerifyAccountFormProps {
  email?: string;
  purpose?: "client" | "professional";
}

export default function VerifyAccountForm({
  email,
  purpose = "client",
}: VerifyAccountFormProps) {
  const router = useRouter();
  const { mutateAsync: verifyClient } = useVerifyAccount();
  const { mutateAsync: verifyProfessional } = useVerifyProfessionalAccount();

  const form = useForm({
    defaultValues: {
      email: email ?? "",
      otp: "",
    },
    validators: {
      onSubmit: verifyOtpSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (purpose === "professional") {
          await verifyProfessional(value);
        } else {
          await verifyClient(value);
        }

        toast.add({
          title: "Account verified",
          description: "Your account is verified. You can sign in now.",
          type: "success",
        });
        router.push("/login");
      } catch (error) {
        toast.add({
          title: "Verification failed",
          description: errorMessage(error, "Invalid or expired OTP"),
          type: "error",
        });
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={Boolean(email)}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors[0] ? (
              <p className="text-xs text-destructive">
                {errorMessage(field.state.meta.errors[0])}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field name="otp">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Verification code</Label>
            <Input
              id={field.name}
              name={field.name}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6-digit code"
              className="tracking-[0.5em]"
              value={field.state.value}
              onChange={(event) =>
                field.handleChange(event.target.value.replace(/\D/g, ""))
              }
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors[0] ? (
              <p className="text-xs text-destructive">
                {errorMessage(field.state.meta.errors[0])}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <p className="text-sm text-muted-foreground">
        We sent a 6-digit code to your email. It expires in 5 minutes.
      </p>

      <Button
        type="submit"
        className="w-full"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? "Verifying..." : "Verify account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
