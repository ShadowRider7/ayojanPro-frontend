"use client";

import { useForm } from "@tanstack/react-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useResetPassword } from "@/hooks";
import type { ResetPasswordPayload } from "@/types";
import { resetPasswordSchema } from "@/validation";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Step two of the password reset flow. Reads the pending `email` from the query
 * string (set by the forgot-password form) and completes the reset with the
 * 6-digit code plus a new password.
 */
export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    if (!email) {
      router.replace("/forgot-password");
    }
  }, [email, router]);

  const form = useForm({
    defaultValues: {
      email,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    } satisfies ResetPasswordFormValues,
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: ({ value }) => {
      const payload: ResetPasswordPayload = {
        email: value.email.trim(),
        otp: value.otp,
        newPassword: value.newPassword,
        confirmPassword: value.confirmPassword,
      };

      resetPassword(payload, {
        onSuccess: () => {
          toast.add({
            title: "Password updated",
            description: "Log in with your new password.",
            type: "success",
          });

          router.push("/login");
        },
        onError: (err) => {
          toast.add({
            title: "Could not reset password",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      });
    },
  });

  if (!email) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Choose a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the code we sent to{" "}
          <span className="font-medium text-foreground">{email}</span> and pick
          a new password.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="otp">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="otp">Verification code</FieldLabel>
                  <InputOTP
                    id="otp"
                    name="otp"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={field.state.value}
                    pattern={REGEXP_ONLY_DIGITS}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  <FieldDescription>
                    The code expires 5 minutes after it was sent.
                  </FieldDescription>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="newPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className="pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className="pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button disabled={isPending} type="submit">
            {isPending ? (
              <>
                <Spinner /> Updating password
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </FieldGroup>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          Use a different email
        </Link>
      </div>
    </div>
  );
}
