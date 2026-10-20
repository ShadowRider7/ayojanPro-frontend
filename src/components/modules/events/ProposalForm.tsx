"use client";

import { useForm } from "@tanstack/react-form";
import { SendIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DateText } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useCreateProposal, useMyServices } from "@/hooks";
import type {
  CreateProposalPayload,
  Event,
  EventServiceRequirement,
  ProfessionalService,
} from "@/types";
import { findMatchingService, toDateTimeLocal } from "@/utils";
import { type ProposalFormValues, proposalFormSchema } from "@/validation";

const PROPOSABLE_STATUSES = ["OPEN", "PARTIALLY_FILLED"] as const;

type ProposalFormProps = {
  event: Event;

  requirements: EventServiceRequirement[];

  bidOnRequirementIds: string[];

  initialRequirementId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type EligibleRequirement = {
  requirement: EventServiceRequirement;
  service: ProfessionalService;
};

function isProposable(requirement: EventServiceRequirement): boolean {
  return PROPOSABLE_STATUSES.includes(
    requirement.status as (typeof PROPOSABLE_STATUSES)[number],
  );
}

function buildItem(
  requirement: EventServiceRequirement,
  service: ProfessionalService,
): ProposalFormValues["items"][number] {
  return {
    id: crypto.randomUUID(),
    eventServiceRequirementId: requirement.id,
    professionalServiceId: service.id,
    proposedAmount: "",
    proposedStartAt: toDateTimeLocal(requirement.startAt),
    proposedEndAt: toDateTimeLocal(requirement.endAt),
  };
}

export function ProposalForm({
  event,
  requirements,
  bidOnRequirementIds,
  initialRequirementId,
  open,
  onOpenChange,
}: ProposalFormProps) {
  const { mutateAsync: createProposal } = useCreateProposal();
  const servicesQuery = useMyServices();
  const services = useMemo(
    () => servicesQuery.data?.data ?? [],
    [servicesQuery.data?.data],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A professional may only propose for requirements matching a service they
  // actually offer.
  const eligibleRequirements = useMemo<EligibleRequirement[]>(() => {
    const activeServices = services.filter((service) => service.isActive);

    return requirements
      .filter(
        (requirement) =>
          isProposable(requirement) &&
          !bidOnRequirementIds.includes(requirement.id),
      )
      .map((requirement) => ({
        requirement,
        service: findMatchingService(requirement.serviceName, activeServices),
      }))
      .filter(
        (entry): entry is EligibleRequirement => entry.service !== undefined,
      );
  }, [requirements, bidOnRequirementIds, services]);

  const initialEntry = initialRequirementId
    ? eligibleRequirements.find(
        (entry) => entry.requirement.id === initialRequirementId,
      )
    : undefined;

  const form = useForm({
    defaultValues: {
      message: "",
      items: initialEntry
        ? [buildItem(initialEntry.requirement, initialEntry.service)]
        : [],
    } satisfies ProposalFormValues,
    validators: {
      onSubmit: proposalFormSchema,
    },
    onSubmit: async ({ value }) => {
      const message = value.message.trim();

      if (value.items.length === 0) {
        return;
      }

      setIsSubmitting(true);

      const results = await Promise.allSettled(
        value.items.map((item) => {
          const payload: CreateProposalPayload = {
            eventId: event.id,
            ...(message ? { message } : {}),
            items: [
              {
                eventServiceRequirementId: item.eventServiceRequirementId,
                professionalServiceId: item.professionalServiceId,
                proposedAmount: Number(item.proposedAmount),
                proposedStartAt: new Date(item.proposedStartAt).toISOString(),
                proposedEndAt: new Date(item.proposedEndAt).toISOString(),
              },
            ],
          };

          return createProposal(payload);
        }),
      );

      setIsSubmitting(false);

      const failures = results.flatMap((result, index) =>
        result.status === "rejected"
          ? [
              {
                serviceName:
                  requirements.find(
                    (candidate) =>
                      candidate.id ===
                      value.items[index]?.eventServiceRequirementId,
                  )?.serviceName ?? "Service",
                message:
                  result.reason?.message ??
                  "Something went wrong. Please try again",
              },
            ]
          : [],
      );
      const sentCount = results.length - failures.length;

      if (failures.length === 0) {
        toast.add({
          title:
            sentCount === 1 ? "Proposal sent" : `${sentCount} proposals sent`,
          description:
            "The client has been notified and can accept or reject each service.",
          type: "success",
        });

        form.setFieldValue("items", []);
        form.setFieldValue("message", "");
        onOpenChange(false);

        return;
      }

      if (sentCount > 0) {
        toast.add({
          title: `${sentCount} sent, ${failures.length} failed`,
          description: failures
            .map((failure) => `${failure.serviceName}: ${failure.message}`)
            .join(" — "),
          type: "error",
        });
      } else {
        toast.add({
          title: "Could not send the proposal",
          description: failures
            .map((failure) => `${failure.serviceName}: ${failure.message}`)
            .join(" — "),
          type: "error",
        });
      }

      // Keep only the services that failed so they can be retried.
      const failedIds = new Set(
        value.items
          .filter((_, index) => results[index]?.status === "rejected")
          .map((item) => item.eventServiceRequirementId),
      );

      form.setFieldValue(
        "items",
        value.items.filter((item) =>
          failedIds.has(item.eventServiceRequirementId),
        ),
      );
    },
  });

  // Re-open the dialog on a single service (the "Propose" button on a
  // requirement) — preselect it once per opening, so unchecking it sticks.
  const preselectedForOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      preselectedForOpen.current = false;
      return;
    }

    if (preselectedForOpen.current) {
      return;
    }

    preselectedForOpen.current = true;

    if (!initialEntry || form.state.values.items.length > 0) {
      return;
    }

    form.pushFieldValue(
      "items",
      buildItem(initialEntry.requirement, initialEntry.service),
    );
  }, [open, initialEntry, form]);

  const toggleRequirement = (entry: EligibleRequirement) => {
    const index = form.state.values.items.findIndex(
      (item) => item.eventServiceRequirementId === entry.requirement.id,
    );

    if (index >= 0) {
      form.removeFieldValue("items", index);
      return;
    }

    form.pushFieldValue("items", buildItem(entry.requirement, entry.service));
  };

  const selectedIds = form.state.values.items.map(
    (item) => item.eventServiceRequirementId,
  );
  const selectedCount = form.state.values.items.length;
  const noServices = services.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send a proposal</DialogTitle>
          <DialogDescription>
            Tick every service of {event.title} you can cover. Each service is
            sent as its own proposal, so the client accepts or rejects them one
            by one.
          </DialogDescription>
        </DialogHeader>

        {servicesQuery.isError ? (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Could not load your services — close this dialog and try again.
          </p>
        ) : noServices ? (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4 text-sm">
            <p className="font-medium">You need at least one service</p>
            <p className="text-muted-foreground">
              You can only propose for services you offer. Add one under
              Services first.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              nativeButton={false}
              render={
                <Link href="/dashboard/professional/services">
                  Go to services
                </Link>
              }
            />
          </div>
        ) : eligibleRequirements.length === 0 ? (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4 text-sm">
            <p className="font-medium">No matching services on this event</p>
            <p className="text-muted-foreground">
              This event needs{" "}
              {requirements
                .filter(isProposable)
                .map((requirement) => requirement.serviceName)
                .join(", ") || "no open services"}
              . You offer{" "}
              {services
                .filter((service) => service.isActive)
                .map((service) => service.name)
                .join(", ") || "no active service"}
              .
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              nativeButton={false}
              render={
                <Link href="/dashboard/professional/services">
                  Manage services
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
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Services you can cover</p>
                <ul className="flex flex-col gap-2">
                  {eligibleRequirements.map((entry) => {
                    const isSelected = selectedIds.includes(
                      entry.requirement.id,
                    );

                    return (
                      <li key={entry.requirement.id}>
                        <label
                          htmlFor={`propose-${entry.requirement.id}`}
                          className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm hover:bg-muted/40 has-[:checked]:border-primary/50 has-[:checked]:bg-muted/40"
                        >
                          <Checkbox
                            id={`propose-${entry.requirement.id}`}
                            className="mt-0.5"
                            checked={isSelected}
                            onCheckedChange={() => toggleRequirement(entry)}
                          />
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="font-medium">
                              {entry.requirement.serviceName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              You offer: {entry.service.name} ·{" "}
                              {Number(
                                entry.requirement.budget,
                              ).toLocaleString()}{" "}
                              {entry.requirement.currency} budget
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <form.Field name="items">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !field.state.meta.isValid &&
                    field.state.value.length > 0;

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
                const service = services.find(
                  (candidate) => candidate.id === item.professionalServiceId,
                );

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <p className="font-heading text-sm font-medium">
                          {requirement?.serviceName ?? "Service"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Covered by {service?.name ?? "your service"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove ${requirement?.serviceName ?? "service"}`}
                        disabled={isSubmitting}
                        onClick={() => form.removeFieldValue("items", index)}
                      >
                        <Trash2Icon /> Remove
                      </Button>
                    </div>

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

                    <div className="grid gap-4 sm:grid-cols-2">
                      <form.Subscribe
                        selector={(state) =>
                          state.values.items[index]?.proposedEndAt ?? ""
                        }
                      >
                        {(itemEndAt) => {
                          const requirementEndAt = requirement
                            ? toDateTimeLocal(requirement.endAt)
                            : undefined;
                          const maxAt =
                            itemEndAt &&
                            (!requirementEndAt || itemEndAt < requirementEndAt)
                              ? itemEndAt
                              : requirementEndAt;

                          return (
                            <form.Field
                              name={`items[${index}].proposedStartAt`}
                            >
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
                                      max={maxAt || undefined}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(event) => {
                                        const nextStartAt = event.target.value;

                                        field.handleChange(nextStartAt);

                                        // Keep the row valid when the start
                                        // moves past the picked end.
                                        if (
                                          nextStartAt &&
                                          itemEndAt &&
                                          nextStartAt >= itemEndAt
                                        ) {
                                          form.setFieldValue(
                                            `items[${index}].proposedEndAt`,
                                            "",
                                          );
                                        }
                                      }}
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
                          );
                        }}
                      </form.Subscribe>

                      <form.Subscribe
                        selector={(state) =>
                          state.values.items[index]?.proposedStartAt ?? ""
                        }
                      >
                        {(itemStartAt) => {
                          const requirementStartAt = requirement
                            ? toDateTimeLocal(requirement.startAt)
                            : undefined;
                          const minAt =
                            itemStartAt &&
                            (!requirementStartAt ||
                              itemStartAt > requirementStartAt)
                              ? itemStartAt
                              : requirementStartAt;

                          return (
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
                                      min={minAt || undefined}
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
                                        <DateText value={requirement.startAt} />{" "}
                                        – <DateText value={requirement.endAt} />
                                      </FieldDescription>
                                    ) : null}
                                  </Field>
                                );
                              }}
                            </form.Field>
                          );
                        }}
                      </form.Subscribe>
                    </div>
                  </div>
                );
              })}

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
            render={<Button variant="outline" disabled={isSubmitting} />}
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="proposal-form"
            disabled={isSubmitting || noServices || selectedCount === 0}
          >
            {isSubmitting ? (
              <>
                <Spinner /> Sending
              </>
            ) : selectedCount > 1 ? (
              <>
                <SendIcon /> Send {selectedCount} proposals
              </>
            ) : (
              <>
                <SendIcon /> Send proposal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
