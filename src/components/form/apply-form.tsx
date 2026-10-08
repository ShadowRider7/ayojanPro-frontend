"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useApplyAsProfessional } from "@/hooks";
import { errorMessage } from "@/lib/utils";
import type { ProfessionalApplicationPayload } from "@/types";

export default function ApplyForm() {
  const router = useRouter();
  const { mutateAsync: apply } = useApplyAsProfessional();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      professionalTitle: "",
      experienceYears: "0",
      phone: "",
      bio: "",
      address: "",
      city: "",
      country: "",
      resume: null as File | null,
      additionalFiles: [] as File[],
    },
    onSubmit: async ({ value }) => {
      if (!value.resume) {
        toast.add({
          title: "Resume required",
          description: "Please attach your resume before submitting.",
          type: "error",
        });
        return;
      }

      const experienceYears = Number(value.experienceYears);
      if (
        !Number.isInteger(experienceYears) ||
        Number.isNaN(experienceYears) ||
        experienceYears < 0
      ) {
        toast.add({
          title: "Invalid experience",
          description: "Experience years must be a non-negative number.",
          type: "error",
        });
        return;
      }

      if (value.name.trim().length < 2 || !value.email.includes("@")) {
        toast.add({
          title: "Check your details",
          description: "Name and a valid email are required.",
          type: "error",
        });
        return;
      }

      const payload: ProfessionalApplicationPayload = {
        data: {
          user: {
            name: value.name.trim(),
            email: value.email.trim(),
          },
          professional: {
            phone: value.phone,
            address: value.address,
            city: value.city,
            country: value.country,
            professionalTitle: value.professionalTitle,
            bio: value.bio,
            experienceYears,
          },
        },
        resume: value.resume,
        additionalFiles: value.additionalFiles,
      };

      try {
        await apply(payload);

        toast.add({
          title: "Application submitted",
          description: "We sent a verification code to your email.",
          type: "success",
        });
        router.push(
          `/apply/verify-account?email=${encodeURIComponent(value.email)}`,
        );
      } catch (error) {
        toast.add({
          title: "Application failed",
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
            </div>
          )}
        </form.Field>

        <form.Field name="professionalTitle">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Professional title</Label>
              <Input
                id={field.name}
                name={field.name}
                placeholder="Event Photographer"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="experienceYears">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Years of experience</Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                min={0}
                placeholder="8"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="phone">
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
            </div>
          )}
        </form.Field>

        <form.Field name="city">
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
            </div>
          )}
        </form.Field>

        <form.Field name="address">
          {(field) => (
            <div className="flex flex-col gap-2 sm:col-span-2">
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
            </div>
          )}
        </form.Field>

        <form.Field name="country">
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
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="bio">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Bio (optional)</Label>
            <textarea
              id={field.name}
              name={field.name}
              rows={4}
              placeholder="Describe your experience and the services you offer..."
              className="flex min-h-24 w-full rounded-4xl border border-input bg-input/30 px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="resume">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Resume (required)</Label>
            <input
              id={field.name}
              name={field.name}
              type="file"
              accept=".pdf,.doc,.docx"
              className="flex w-full cursor-pointer items-center rounded-4xl border border-dashed border-input bg-input/30 px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:bg-input/50"
              onChange={(event) =>
                field.handleChange(event.target.files?.[0] ?? null)
              }
              onBlur={field.handleBlur}
            />
            <p className="text-xs text-muted-foreground">
              {field.state.value
                ? `Selected: ${field.state.value.name}`
                : "PDF or Word document, up to 10MB."}
            </p>
          </div>
        )}
      </form.Field>

      <form.Field name="additionalFiles">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Supporting documents (optional)</Label>
            <input
              id={field.name}
              name={field.name}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="flex w-full cursor-pointer items-center rounded-4xl border border-dashed border-input bg-input/30 px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:bg-input/50"
              onChange={(event) =>
                field.handleChange(Array.from(event.target.files ?? []))
              }
              onBlur={field.handleBlur}
            />
            <p className="text-xs text-muted-foreground">
              {field.state.value.length > 0
                ? `${field.state.value.length} file(s) selected`
                : "Portfolio links, certificates, IDs, etc."}
            </p>
          </div>
        )}
      </form.Field>

      <Button
        type="submit"
        className="w-full"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? "Submitting..." : "Submit application"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
