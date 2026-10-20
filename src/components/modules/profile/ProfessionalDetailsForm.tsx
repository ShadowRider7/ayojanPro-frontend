"use client";

import { useForm } from "@tanstack/react-form";
import { PhoneInput } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useUpdateProfessionalProfile } from "@/hooks";
import type { Professional, UpdateProfessionalProfilePayload } from "@/types";
import { toE164Phone } from "@/utils";
import {
  type UpdateProfessionalProfileFormValues,
  updateProfessionalProfileSchema,
} from "@/validation";

type ProfessionalDetailsFormProps = {
  professional: Professional;
  className?: string;
};

function seedForm(
  professional: Professional,
): UpdateProfessionalProfileFormValues {
  return {
    professionalTitle: professional.professionalTitle,
    experienceYears: String(professional.experienceYears),
    bio: professional.bio ?? "",
    phone: professional.phone ?? "",
    address: professional.address ?? "",
    city: professional.city ?? "",
    country: professional.country ?? "",
    acceptingBookings: professional.acceptingBookings,
  };
}

export function ProfessionalDetailsForm({
  professional,
  className,
}: ProfessionalDetailsFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfessionalProfile();

  const form = useForm({
    defaultValues: seedForm(professional),
    validators: {
      onSubmit: updateProfessionalProfileSchema,
    },
    onSubmit: ({ value }) => {
      const clearable = (text: string | undefined) => {
        const trimmed = text?.trim() ?? "";
        return trimmed === "" ? null : trimmed;
      };

      const payload: UpdateProfessionalProfilePayload = {
        professionalTitle: value.professionalTitle.trim(),
        experienceYears: Number(value.experienceYears),
        acceptingBookings: value.acceptingBookings,
        bio: clearable(value.bio),
        phone: toE164Phone(value.phone),
        address: clearable(value.address),
        city: clearable(value.city),
        country: clearable(value.country),
      };

      updateProfile(payload, {
        onSuccess: (response) => {
          form.reset(seedForm(response.data));

          toast.add({
            title: "Profile updated",
            description: "Your changes are live on your public profile.",
            type: "success",
          });
        },
        onError: (err) => {
          toast.add({
            title: "Could not update profile",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <Card size="sm" className={className}>
      <CardHeader>
        <CardTitle>Profile details</CardTitle>
        <CardDescription>
          What clients see on your public profile — title, bio, contact details
          and booking availability.
        </CardDescription>
      </CardHeader>

      <form
        id="professional-profile-form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
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
                        placeholder="Event Photographer"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
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
                        min="0"
                        step="1"
                        placeholder="5"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
              <form.Field name="acceptingBookings">
                {(field) => (
                  <Checkbox
                    id="acceptingBookings"
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                    className="mt-0.5"
                  />
                )}
              </form.Field>
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="acceptingBookings">
                  Accepting bookings
                </FieldLabel>
                <FieldDescription>
                  Show clients you are open to new work on your profile and in
                  search results.
                </FieldDescription>
              </div>
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
                      rows={4}
                      maxLength={500}
                      placeholder="A short introduction about you and the events you cover."
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <FieldDescription>
                      Up to 500 characters. Leave blank to clear.
                    </FieldDescription>
                  </Field>
                );
              }}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="phone">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                      <PhoneInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onValueChange={(value) => field.handleChange(value)}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                      <FieldDescription>Leave blank to clear.</FieldDescription>
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="address">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="House 12, Road 5, Dhanmondi"
                        autoComplete="street-address"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

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
                        autoComplete="address-level2"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
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
                        autoComplete="country-name"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </FieldGroup>
        </CardContent>
      </form>

      <CardFooter className="justify-end">
        <Button
          type="submit"
          form="professional-profile-form"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Spinner /> Saving
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
