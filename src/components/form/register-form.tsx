"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useRegistration } from "@/hooks";
import { errorMessage } from "@/lib/utils";
import type { RegistrationPayload } from "@/types";
import { registerSchema } from "@/validation";

export default function RegisterForm() {
  const router = useRouter();
  const { mutateAsync: register } = useRegistration();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      client: {
        phone: "",
        bio: "",
        address: "",
        city: "",
        country: "",
      },
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      const payload: RegistrationPayload = {
        name: value.name,
        email: value.email,
        password: value.password,
        client: value.client,
      };

      try {
        await register(payload);

        toast.add({
          title: "Registration successful",
          description: "We sent a verification code to your email.",
          type: "success",
        });
        router.push(
          `/register/verify-account?email=${encodeURIComponent(value.email)}`,
        );
      } catch (error) {
        toast.add({
          title: "Registration failed",
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
      <form.Field name="name">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Full name</Label>
            <Input
              id={field.name}
              name={field.name}
              autoComplete="name"
              placeholder="John Doe"
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
            <Label htmlFor={field.name}>Password</Label>
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
            <Label htmlFor={field.name}>Confirm password</Label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
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

      <form.Field name="client.phone">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Phone (optional)</Label>
            <Input
              id={field.name}
              name={field.name}
              type="tel"
              autoComplete="tel"
              placeholder="+8801712345678"
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

      <form.Field name="client.bio">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Bio (optional)</Label>
            <textarea
              id={field.name}
              name={field.name}
              rows={3}
              placeholder="Tell professionals about your events..."
              className="flex min-h-20 w-full rounded-4xl border border-input bg-input/30 px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <form.Field name="client.address">
          {(field) => (
            <div className="flex flex-col gap-2 sm:col-span-3">
              <Label htmlFor={field.name}>Address (optional)</Label>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="street-address"
                placeholder="House 12, Road 5, Banani"
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

        <form.Field name="client.city">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>City (optional)</Label>
              <Input
                id={field.name}
                name={field.name}
                placeholder="Dhaka"
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

        <form.Field name="client.country">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Country (optional)</Label>
              <Input
                id={field.name}
                name={field.name}
                placeholder="Bangladesh"
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
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Want to offer services?{" "}
        <Link href="/apply" className="text-primary hover:underline">
          Apply as a professional
        </Link>
      </p>
    </form>
  );
}
