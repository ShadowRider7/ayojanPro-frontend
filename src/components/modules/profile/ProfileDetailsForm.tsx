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
import { useUpdateClientProfile } from "@/hooks";
import type { Client, UpdateClientProfilePayload } from "@/types";
import { toE164Phone } from "@/utils";
import {
  type UpdateClientProfileFormValues,
  updateClientProfileSchema,
  validateOnChange,
} from "@/validation";

type ProfileDetailsFormProps = {
  client: Client | null;
  className?: string;
};

function seedForm(client: Client | null): UpdateClientProfileFormValues {
  return {
    bio: client?.bio ?? "",
    phone: client?.phone ?? "",
    address: client?.address ?? "",
    city: client?.city ?? "",
    country: client?.country ?? "",
  };
}

export function ProfileDetailsForm({
  client,
  className,
}: ProfileDetailsFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateClientProfile();

  const form = useForm({
    defaultValues: seedForm(client),
    validators: validateOnChange(updateClientProfileSchema),
    onSubmit: ({ value }) => {
      const phone = toE164Phone(value.phone);
      const address = value.address?.trim() ?? "";

      const payload: UpdateClientProfilePayload = {
        bio: value.bio?.trim() ?? "",
        phone: phone ?? undefined,
        address: address === "" ? undefined : address,
        city: value.city?.trim() ?? "",
        country: value.country?.trim() ?? "",
      };

      updateProfile(payload, {
        onSuccess: (response) => {
          form.reset(seedForm(response.data));

          toast.add({
            title: "Profile updated",
            description: "Your changes have been saved.",
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
          Contact details and a short bio for your client account.
        </CardDescription>
      </CardHeader>

      <form
        id="client-profile-form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent>
          <FieldGroup>
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
                      placeholder="A short introduction about you and the events you organise."
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <FieldDescription>Up to 500 characters.</FieldDescription>
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
                        onValueChange={field.handleChange}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                      <FieldDescription>
                        Leave blank to keep your saved number.
                      </FieldDescription>
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
                        value={field.state.value ?? ""}
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
                        Leave blank to keep your saved address.
                      </FieldDescription>
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
                        value={field.state.value ?? ""}
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
                        value={field.state.value ?? ""}
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
        <Button type="submit" form="client-profile-form" disabled={isPending}>
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
