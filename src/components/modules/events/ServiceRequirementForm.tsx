"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { DateText } from "@/components/shared";
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
import {
  useCreateServiceRequirement,
  useUpdateServiceRequirement,
} from "@/hooks";
import type {
  CreateServiceRequirementPayload,
  Event,
  EventServiceRequirement,
} from "@/types";
import { toDateTimeLocal, toNumber } from "@/utils/formatters";
import {
  type ServiceRequirementFormValues,
  serviceRequirementFormSchema,
} from "@/validation";

type ServiceRequirementFormProps = {
  /** The host event; its schedule bounds the requirement's dates. */
  hostEvent: Event;
  /** Present in edit mode; omit to add a requirement. */
  requirement: EventServiceRequirement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Dialog form for one service requirement — `POST /event/services/:eventId`
 * or `PATCH /event/update/:eventId/services/:serviceId`. The host event's
 * schedule is passed to the schema pair so the "within the event schedule"
 * rule is explained inline instead of surfacing as the API's 400. The parent
 * mounts it fresh per dialog open, so the defaults always seed from the
 * requirement being edited (or the event window for a new one).
 */
export function ServiceRequirementForm({
  hostEvent,
  requirement,
  open,
  onOpenChange,
}: ServiceRequirementFormProps) {
  const queryClient = useQueryClient();

  const { mutate: createRequirement, isPending: isCreating } =
    useCreateServiceRequirement();
  const { mutate: updateRequirement, isPending: isUpdating } =
    useUpdateServiceRequirement();
  const isPending = isCreating || isUpdating;

  const form = useForm({
    defaultValues: {
      serviceName: requirement?.serviceName ?? "",
      description: requirement?.description ?? "",
      budget: requirement ? String(toNumber(requirement.budget) ?? "") : "",
      startAt: toDateTimeLocal(requirement?.startAt ?? hostEvent.startAt),
      endAt: toDateTimeLocal(requirement?.endAt ?? hostEvent.endAt),
    } satisfies ServiceRequirementFormValues,
    validators: {
      onSubmit: serviceRequirementFormSchema(hostEvent),
    },
    onSubmit: ({ value }) => {
      const payload: CreateServiceRequirementPayload = {
        serviceName: value.serviceName,
        description: value.description,
        budget: Number(value.budget),
        startAt: new Date(value.startAt).toISOString(),
        endAt: new Date(value.endAt).toISOString(),
      };

      const handleSuccess = (title: string) => {
        toast.add({ title, type: "success" });
        queryClient.invalidateQueries({ queryKey: ["events"] });
        onOpenChange(false);
      };

      const handleError = (title: string) => (err: Error) => {
        toast.add({
          title,
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
      };

      if (requirement) {
        updateRequirement(
          {
            eventId: hostEvent.id,
            serviceId: requirement.id,
            payload,
          },
          {
            onSuccess: () => handleSuccess("Requirement updated"),
            onError: handleError("Could not update requirement"),
          },
        );
        return;
      }

      createRequirement(
        { eventId: hostEvent.id, payload },
        {
          onSuccess: () => handleSuccess("Requirement added"),
          onError: handleError("Could not add requirement"),
        },
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {requirement ? "Edit requirement" : "Add requirement"}
          </DialogTitle>
          <DialogDescription>
            The service professionals will proposal on. Dates must fall within
            the event schedule.
          </DialogDescription>
        </DialogHeader>

        <form
          id="service-requirement-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="serviceName">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Service</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Photography"
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

            <form.Field name="budget">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Budget</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="0"
                      step="any"
                      placeholder="45000"
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
                      In BDT. Professionals see this when deciding whether to
                      proposal.
                    </FieldDescription>
                  </Field>
                );
              }}
            </form.Field>

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
                      rows={2}
                      placeholder="Full-day coverage, two photographers, edited digital album."
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

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="startAt">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Starts at</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="datetime-local"
                        min={toDateTimeLocal(hostEvent.startAt)}
                        max={toDateTimeLocal(hostEvent.endAt)}
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

              <form.Field name="endAt">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Ends at</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="datetime-local"
                        min={toDateTimeLocal(hostEvent.startAt)}
                        max={toDateTimeLocal(hostEvent.endAt)}
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
                        Event window: <DateText value={hostEvent.startAt} /> –{" "}
                        <DateText value={hostEvent.endAt} />
                      </FieldDescription>
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="service-requirement-form"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner /> Saving
              </>
            ) : requirement ? (
              "Save changes"
            ) : (
              "Add requirement"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
