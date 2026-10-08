"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useForgotPassword } from "@/hooks";
import { errorMessage } from "@/lib/utils";
import { forgotPasswordSchema } from "@/validation";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { mutateAsync: forgotPassword } = useForgotPassword();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPassword(value);

        toast.add({
          title: "OTP sent",
          description: "Check your email for the password reset code.",
          type: "success",
        });
        router.push(`/reset-password?email=${encodeURIComponent(value.email)}`);
      } catch (error) {
        toast.add({
          title: "Request failed",
          description: errorMessage(error),
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
        {form.state.isSubmitting ? "Sending..." : "Send reset code"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
