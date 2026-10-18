"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAddService, useUpdateService } from "@/hooks";
import type {
  CreateProfessionalServicePayload,
  ProfessionalService,
} from "@/types";
import {
  type ProfessionalServiceFormValues,
  professionalServiceFormSchema,
} from "@/validation";

type ServiceFormProps = {
  service: ProfessionalService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ServiceForm({ service, open, onOpenChange }: ServiceFormProps) {
  const { mutate: addService, isPending: isAdding } = useAddService();
  const { mutate: updateService, isPending: isUpdating } = useUpdateService();
  const isPending = isAdding || isUpdating;

  const form = useForm({
    defaultValues: {
      name: service?.name ?? "",
      pricingNote: service?.pricingNote ?? "",
      description: service?.description ?? "",
      minimumPrice: service ? String(service.minimumPrice ?? "") : "",
      maximumPrice: service ? String(service.maximumPrice ?? "") : "",
    } satisfies ProfessionalServiceFormValues,
    validators: {
      onSubmit: professionalServiceFormSchema,
    },
    onSubmit: ({ value }) => {
      const payload: CreateProfessionalServicePayload = {
        name: value.name.trim(),
        pricingNote: value.pricingNote.trim(),
        description: value.description.trim(),
        minimumPrice: Number(value.minimumPrice),
        maximumPrice: Number(value.maximumPrice),
      };

      const handleSuccess = (title: string) => {
        toast.add({ title, type: "success" });
        onOpenChange(false);
      };

      const handleError = (title: string) => (err: Error) => {
        toast.add({
          title,
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
      };

      if (service) {
        updateService(
          { serviceId: service.id, payload },
          {
            onSuccess: () => handleSuccess("Service updated"),
            onError: handleError("Could not update service"),
          },
        );
        return;
      }

      addService(payload, {
        onSuccess: () => handleSuccess("Service added"),
        onError: handleError("Could not add service"),
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "Add service"}</DialogTitle>
          <DialogDescription>
            What you offer and what it costs — clients compare these across
            professionals.
          </DialogDescription>
        </DialogHeader>

        <form
          id="service-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Service name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Wedding Photography"
                      maxLength={150}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="pricingNote">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Pricing note</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="per event"
                      maxLength={1000}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                    <FieldDescription>
                      How the price is charged, e.g. “per event”.
                    </FieldDescription>
                  </Field>
                );
              }}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="minimumPrice">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Minimum price (৳)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        placeholder="25000"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="maximumPrice">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Maximum price (৳)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        placeholder="80000"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                      <FieldDescription>
                        Use the same value for both if you charge a fixed rate.
                      </FieldDescription>
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <form.Field name="description">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      rows={3}
                      maxLength={1000}
                      placeholder="What this service includes."
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </DialogClose>
          <Button type="submit" form="service-form" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner /> Saving
              </>
            ) : service ? (
              "Save changes"
            ) : (
              "Add service"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
