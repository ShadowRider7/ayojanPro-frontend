"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUpload, PhoneInput } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useApplyAsProfessional } from "@/hooks";
import { MAX_UPLOAD_SIZE_MB } from "@/lib/constants";
import type { ApplyAsProfessionalPayload } from "@/types";
import { toE164Phone } from "@/utils";
import {
  type ProfessionalApplicationFormValues,
  professionalApplicationSchema,
  validateOnChange,
} from "@/validation";

const DEFAULT_VALUES: ProfessionalApplicationFormValues = {
  name: "",
  email: "",
  phone: "",
  professionalTitle: "",
  experienceYears: "",
  bio: "",
  city: "",
  country: "",
  resume: [],
  additionalFiles: [],
};

export default function ApplyAsProfessionalForm() {
  const router = useRouter();

  const { mutate: apply, isPending } = useApplyAsProfessional();

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: validateOnChange(professionalApplicationSchema),
    onSubmit: ({ value }) => {
      const phone = toE164Phone(value.phone);
      const bio = value.bio.trim();
      const city = value.city.trim();
      const country = value.country.trim();

      const payload: ApplyAsProfessionalPayload = {
        user: {
          name: value.name.trim(),
          email: value.email.trim(),
        },
        professional: {
          phone: phone ?? undefined,
          professionalTitle: value.professionalTitle.trim(),
          bio: bio === "" ? undefined : bio,
          experienceYears: Number(value.experienceYears),
          city: city === "" ? undefined : city,
          country: country === "" ? undefined : country,
        },
      };

      apply(
        {
          payload,
          resume: value.resume[0],
          additionalFiles: value.additionalFiles,
        },
        {
          onSuccess: () => {
            toast.add({
              title: "Application submitted",
              description:
                "We sent a 6-digit verification code to your email address. It expires in 1 hour.",
              type: "success",
            });

            const params = new URLSearchParams({ email: payload.user.email });
            router.push(
              `/apply-as-professional/verify-account?${params.toString()}`,
            );
          },
          onError: (err) => {
            toast.add({
              title: "Could not submit application",
              description:
                err.message || "Something went wrong. Please try again",
              type: "error",
            });
          },
        },
      );
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Apply as a professional
        </h1>
        <p className="text-sm text-muted-foreground">
          Tell us about your craft. Our team reviews every application before it
          goes live.
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
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Jane Doe"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="name"
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="email"
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <FieldDescription>
                      The verification code and all application updates go to
                      this address.
                    </FieldDescription>
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="phone">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                    <PhoneInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(value) => field.handleChange(value)}
                      aria-invalid={isInvalid}
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="experienceYears">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Years of experience
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="5"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="professionalTitle">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Professional title
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="Event Photographer"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    disabled={isPending}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  <FieldDescription>
                    The title clients see when browsing professionals — for
                    example Event Photographer, DJ or Caterer.
                  </FieldDescription>
                </Field>
              );
            }}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="city">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>City</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Dhaka"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="address-level2"
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="country">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Bangladesh"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="country-name"
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="bio">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    placeholder="A short introduction about your work, your style and the events you cover."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    disabled={isPending}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  <FieldDescription>
                    Optional — you can flesh this out later from your profile.
                  </FieldDescription>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="resume">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldTitle>Resume</FieldTitle>
                  <FileUpload
                    value={field.state.value}
                    onChange={field.handleChange}
                    accept=".pdf,.doc,.docx"
                    disabled={isPending}
                    description={`PDF or Word document, up to ${MAX_UPLOAD_SIZE_MB} MB`}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="additionalFiles">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldTitle>Additional files</FieldTitle>
                  <FileUpload
                    value={field.state.value}
                    onChange={field.handleChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple
                    disabled={isPending}
                    prompt="Add certificates or work samples"
                    description={`Optional — up to 10 files, ${MAX_UPLOAD_SIZE_MB} MB each`}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button disabled={isPending} type="submit">
            {isPending ? (
              <>
                <Spinner /> Submitting application
              </>
            ) : (
              "Submit application"
            )}
          </Button>
        </FieldGroup>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Looking to book professionals instead?{" "}
        <Link
          href="/register"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          Create a client account
        </Link>
      </div>
    </div>
  );
}
