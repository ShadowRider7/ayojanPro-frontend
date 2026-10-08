"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogin } from "@/hooks";
import { dashboardPathForRole, errorMessage } from "@/lib/utils";
import { loginSchema } from "@/validation";

export default function LoginForm() {
  const router = useRouter();
  const { mutateAsync: login } = useLogin();
  const { refetch } = useGetMe();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await login(value);

        const me = await refetch();
        const user = me.data?.data;

        if (!user) {
          toast.add({
            title: "Session error",
            description: "Logged in, but your profile could not be loaded.",
            type: "error",
          });
          return;
        }

        toast.add({
          title: "Welcome back",
          description: `Logged in as ${user.name}`,
          type: "success",
        });
        router.push(dashboardPathForRole(user.role));
      } catch (error) {
        toast.add({
          title: "Login failed",
          description: errorMessage(error, "Invalid email or password"),
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

      <form.Field name="password">
        {(field) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.name}>Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
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
        {form.state.isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
