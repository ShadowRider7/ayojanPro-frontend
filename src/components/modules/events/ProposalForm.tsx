"use client";

import { useForm } from "@tanstack/react-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateProposal, useMyServices } from "@/hooks";
import type {
  CreateProposalPayload,
  Event,
  EventServiceRequirement,
} from "@/types";
import { toDateTimeLocal } from "@/utils/formatters";
import { type ProposalFormValues, proposalFormSchema } from "@/validation";

/** Only these requirement states can still receive proposals (backend rule). */
const PROPOSABLE_STATUSES = ["OPEN", "PARTIALLY_FILLED"] as const;

type ProposalFormProps = {
  /** The published event being bid on — its schedule bounds every item. */
  event: Event;
  /** The event's live (non-deleted) requirements. */
  requirements: EventServiceRequirement[];
  /** Requirements where this professional already has an active item (409 if rebid). */
  bidOnRequirementIds: string[];
  /** Preselects the first item's requirement; omit to start blank. */
  initialRequirementId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function newRequirementIds(
  requirements: EventServiceRequirement[],
  bidOn: string[],
): string[] {
  const blocked = new Set(bidOn);

  return requirements
    .filter(
      (requirement) =>
        !blocked.has(requirement.id) &&
        PROPOSABLE_STATUSES.includes(
          requirement.status as (typeof PROPOSABLE_STATUSES)[number],
        ),
    )
    .map((requirement) => requirement.id);
}

function blankItem(event: Event): ProposalFormValues["items"][number] {
  return {
    id: crypto.randomUUID(),
    eventServiceRequirementId: "",
    professionalServiceId: "",
    proposedAmount: "",
    proposedStartAt: toDateTimeLocal(event.startAt),
    proposedEndAt: toDateTimeLocal(event.endAt),
  };
}

/**
 * Dialog form for `POST /proposal/events/:eventId` — one proposal covering
 * one or more of the event's requirements. Each item picks a requirement
 * (only open ones the professional has not bid on yet) and one of their own
 * services, and quotes an amount + schedule; the requirement's window seeds
 * the dates and caps the `datetime-local` inputs. The parent mounts it fresh
 * per dialog open, so the defaults always re-seed.
 */
export function ProposalForm({
  event,
  requirements,
  bidOnRequirementIds,
  initialRequirementId,
  open,
  onOpenChange,
}: ProposalFormProps) {
  const { mutate: createProposal, isPending } = useCreateProposal();
  const servicesQuery = useMyServices();
  const services = servicesQuery.data?.data ?? [];

  const selectableRequirementIds = newRequirementIds(
    requirements,
    bidOnRequirementIds,
  );
  const requirementItems = selectableRequirementIds.map((id) => {
    const requirement = requirements.find((candidate) => candidate.id === id);

    return {
      value: id,
      label: requirement?.serviceName ?? "Service requirement",
    };
  });
  const serviceItems = services.map((service) => ({
    value: service.id,
    label: service.name,
  }));

  const initialRequirement = initialRequirementId
    ? requirements.find((candidate) => candidate.id === initialRequirementId)
    : undefined;

  const form = useForm({
    defaultValues: {
      message: "",
      items: [
        {
          ...blankItem(event),
          eventServiceRequirementId: initialRequirement?.id ?? "",
          proposedStartAt: toDateTimeLocal(
            initialRequirement?.startAt ?? event.startAt,
          ),
          proposedEndAt: toDateTimeLocal(
            initialRequirement?.endAt ?? event.endAt,
          ),
        },
      ],
    } satisfies ProposalFormValues,
    validators: {
      onSubmit: proposalFormSchema,
    },
    onSubmit: ({ value }) => {
      const payload: CreateProposalPayload = {
        eventId: event.id,
        ...(value.message.trim() ? { message: value.message.trim() } : {}),
        items: value.items.map((item) => ({
          eventServiceRequirementId: item.eventServiceRequirementId,
          professionalServiceId: item.professionalServiceId,
          proposedAmount: Number(item.proposedAmount),
          proposedStartAt: new Date(item.proposedStartAt).toISOString(),
          proposedEndAt: new Date(item.proposedEndAt).toISOString(),
        })),
      };

      createProposal(payload, {
        onSuccess: () => {
          toast.add({
            title: "Proposal submitted",
            description:
              "The client has been notified and can accept or reject it from their event.",
            type: "success",
          });
          onOpenChange(false);
        },
        onError: (err) => {
          toast.add({
            title: "Could not submit the proposal",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send a proposal</DialogTitle>
          <DialogDescription>
            Quote an amount and schedule for each service you want to cover on{" "}
            {event.title}. The client accepts or rejects the whole proposal.
          </DialogDescription>
        </DialogHeader>

        {servicesQuery.isError ? (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Could not load your services — close this dialog and try again.
          </p>
        ) : serviceItems.length === 0 ? (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4 text-sm">
            <p className="font-medium">You need at least one service</p>
            <p className="text-muted-foreground">
              Every proposal item offers one of your services. Add one under
              Services first.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              render={
                <Link href="/dashboard/professional/services">
                  Go to services
                </Link>
              }
            />
          </div>
        ) : (
          <form
            id="proposal-form"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="items">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return isInvalid ? (
                    <Field data-invalid>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  ) : null;
                }}
              </form.Field>

              {form.state.values.items.map((item, index) => {
                const requirement = requirements.find(
                  (candidate) =>
                    candidate.id === item.eventServiceRequirementId,
                );
                const otherSelectedIds = form.state.values.items
                  .filter((_, otherIndex) => otherIndex !== index)
                  .map((other) => other.eventServiceRequirementId);
                // Keep the current selection visible while hiding requirements
                // another row already covers (the backend rejects a repeat bid).
                const rowRequirementItems = [
                  ...(item.eventServiceRequirementId
                    ? requirementItems.filter(
                        (option) =>
                          option.value === item.eventServiceRequirementId,
                      )
                    : []),
                  ...requirementItems.filter(
                    (option) =>
                      option.value !== item.eventServiceRequirementId &&
                      !otherSelectedIds.includes(option.value),
                  ),
                ];

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-heading text-sm font-medium">
                        Service {index + 1}
                      </p>
                      {form.state.values.items.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Remove service ${index + 1}`}
                          disabled={isPending}
                          onClick={() => form.removeFieldValue("items", index)}
                        >
                          <Trash2Icon /> Remove
                        </Button>
                      ) : null}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <form.Field
                        name={`items[${index}].eventServiceRequirementId`}
                      >
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Requirement
                              </FieldLabel>
                              <Select
                                items={rowRequirementItems}
                                value={field.state.value || null}
                                onValueChange={(value) => {
                                  field.handleChange(value ?? "");
                                  const next = requirements.find(
                                    (candidate) => candidate.id === value,
                                  );

                                  if (next) {
                                    // Seed the quote with the requirement's own window.
                                    form.setFieldValue(
                                      `items[${index}].proposedStartAt`,
                                      toDateTimeLocal(next.startAt),
                                    );
                                    form.setFieldValue(
                                      `items[${index}].proposedEndAt`,
                                      toDateTimeLocal(next.endAt),
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger
                                  className="w-full"
                                  aria-label="Requirement"
                                >
                                  <SelectValue placeholder="Pick a requirement" />
                                </SelectTrigger>
                                <SelectContent>
                                  {rowRequirementItems.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {isInvalid ? (
                                <FieldError errors={field.state.meta.errors} />
                              ) : null}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field
                        name={`items[${index}].professionalServiceId`}
                      >
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Your service
                              </FieldLabel>
                              <Select
                                items={serviceItems}
                                value={field.state.value || null}
                                onValueChange={(value) =>
                                  field.handleChange(value ?? "")
                                }
                              >
                                <SelectTrigger
                                  className="w-full"
                                  aria-label="Your service"
                                >
                                  <SelectValue placeholder="Pick one of your services" />
                                </SelectTrigger>
                                <SelectContent>
                                  {serviceItems.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {isInvalid ? (
                                <FieldError errors={field.state.meta.errors} />
                              ) : null}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name={`items[${index}].proposedAmount`}>
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Proposed amount (BDT)
                              </FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                type="number"
                                min="0"
                                step="any"
                                placeholder="40000"
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
                              {requirement ? (
                                <FieldDescription>
                                  Client budget:{" "}
                                  {Number(requirement.budget).toLocaleString()}{" "}
                                  {requirement.currency}
                                </FieldDescription>
                              ) : null}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <div className="grid gap-4">
                        <form.Field name={`items[${index}].proposedStartAt`}>
                          {(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;

                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Starts at
                                </FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  type="datetime-local"
                                  min={
                                    requirement
                                      ? toDateTimeLocal(requirement.startAt)
                                      : undefined
                                  }
                                  max={
                                    requirement
                                      ? toDateTimeLocal(requirement.endAt)
                                      : undefined
                                  }
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  aria-invalid={isInvalid}
                                />
                                {isInvalid ? (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                ) : null}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name={`items[${index}].proposedEndAt`}>
                          {(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;

                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Ends at
                                </FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  type="datetime-local"
                                  min={
                                    requirement
                                      ? toDateTimeLocal(requirement.startAt)
                                      : undefined
                                  }
                                  max={
                                    requirement
                                      ? toDateTimeLocal(requirement.endAt)
                                      : undefined
                                  }
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  aria-invalid={isInvalid}
                                />
                                {isInvalid ? (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                ) : null}
                                {requirement ? (
                                  <FieldDescription>
                                    Requirement window:{" "}
                                    <DateText value={requirement.startAt} /> –{" "}
                                    <DateText value={requirement.endAt} />
                                  </FieldDescription>
                                ) : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                disabled={
                  isPending ||
                  form.state.values.items.length >= requirementItems.length
                }
                onClick={() => form.pushFieldValue("items", blankItem(event))}
              >
                <PlusIcon /> Add another service
              </Button>

              <form.Field name="message">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Cover note (optional)
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        rows={3}
                        placeholder="Why you are the right professional for this event…"
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
        )}

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="proposal-form"
            disabled={isPending || serviceItems.length === 0}
          >
            {isPending ? (
              <>
                <Spinner /> Sending
              </>
            ) : (
              "Send proposal"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
