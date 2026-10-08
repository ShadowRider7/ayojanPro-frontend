"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useResetPassword } from "@/hooks";
import { errorMessage } from "@/lib/utils";
import { resetPasswordSchema } from "@/validation";

export default function ResetPasswordForm({ email }: { email?: string }) {
  const router = useRouter();
  const { mutateAsync: resetPassword } = useResetPassword();

  const form = useForm({
    defaultValues: {
      email: email ?? "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await resetPassword(value);

        toast.add({
          title: "Password updated",
          description: "You can now sign in with your new password.",
          type: "success",
        });
        router.push("/login");
      } catch (error) {
        toast.add({
          title: "Reset failed",
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
            <Label htmlFor={field.name}>Reset code</Label>
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

      <form.Field name="newPassword">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>New password</Label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
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

      <form.Field name="confirmPassword">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Confirm new password</Label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
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

      <Button
        type="submit"
        className="w-full"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? "Updating..." : "Update password"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Need a new code?{" "}
        <Link href="/forgot-password" className="text-primary hover:underline">
          Resend it
        </Link>
      </p>
    </form>
  );
}
