"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/shared";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateEvent, useEvent, useUpdateEvent } from "@/hooks";
import { EVENT_TYPE_OPTIONS } from "@/lib/constants";
import type { CreateEventPayload, Event } from "@/types";
import { EVENT_TYPES } from "@/types";
import { toDateTimeLocal } from "@/utils/formatters";
import {
  type EventFormValues,
  eventFormSchema,
  validateOnChange,
} from "@/validation";

type EventFormProps = {
  eventId?: string;
};

function seedForm(existingEvent: Event | null): EventFormValues {
  return {
    title: existingEvent?.title ?? "",
    description: existingEvent?.description ?? "",
    eventType: existingEvent?.eventType ?? EVENT_TYPES[0],
    address: existingEvent?.address ?? "",
    city: existingEvent?.city ?? "",
    country: existingEvent?.country ?? "",
    startAt: toDateTimeLocal(existingEvent?.startAt),
    endAt: toDateTimeLocal(existingEvent?.endAt),
  };
}

export function EventForm({ eventId }: EventFormProps) {
  const isEdit = Boolean(eventId);
  const { data, isPending, isError, error, refetch } = useEvent(eventId ?? "");

  if (!isEdit) {
    return <EventFormFields existingEvent={null} />;
  }

  if (isPending) {
    return <EventFormSkeleton />;
  }

  if (isError || !data?.data) {
    return (
      <ErrorState
        title="Could not load this event"
        error={error}
        onRetry={refetch}
      />
    );
  }

  return <EventFormFields existingEvent={data.data} />;
}

function EventFormFields({ existingEvent }: { existingEvent: Event | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent();
  const isPending = isCreating || isUpdating;

  const form = useForm({
    defaultValues: seedForm(existingEvent),
    validators: validateOnChange(eventFormSchema),
    onSubmit: ({ value }) => {
      const payload: CreateEventPayload = {
        title: value.title,
        description: value.description,
        eventType: value.eventType,
        address: value.address,
        city: value.city,
        country: value.country,
        startAt: new Date(value.startAt).toISOString(),
        endAt: new Date(value.endAt).toISOString(),
      };

      const handleSuccess = (savedEvent: Event, toastTitle: string) => {
        toast.add({
          title: toastTitle,
          description: existingEvent
            ? "Your changes have been saved."
            : "Next, add the services you need, then publish it so professionals can find it.",
          type: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["events"] });
        router.push(`/dashboard/events/${savedEvent.id}`);
      };

      if (existingEvent) {
        updateEvent(
          { eventId: existingEvent.id, payload },
          {
            onSuccess: (response) =>
              handleSuccess(response.data, "Event updated"),
            onError: (err) => {
              toast.add({
                title: "Could not update event",
                description:
                  err.message || "Something went wrong. Please try again",
                type: "error",
              });
            },
          },
        );
        return;
      }

      createEvent(payload, {
        onSuccess: (response) => handleSuccess(response.data, "Event created"),
        onError: (err) => {
          toast.add({
            title: "Could not create event",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      });
    },
  });

  const backHref = existingEvent
    ? `/dashboard/events/${existingEvent.id}`
    : "/dashboard/events";

  return (
    <Card size="sm" className="max-w-2xl">
      <CardHeader>
        <CardTitle>{existingEvent ? "Edit event" : "New event"}</CardTitle>
        <CardDescription>
          {existingEvent
            ? "Update the details below. Rescheduling also clamps your service requirements into the new window."
            : "Tell professionals what you are planning. The event stays a draft until you publish it."}
        </CardDescription>
      </CardHeader>

      <form
        id="event-form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent>
          <FieldGroup>
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Sarah & Amir's wedding"
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
                      placeholder="A riverside evening wedding with around 250 guests."
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
              <form.Subscribe selector={(state) => state.values.endAt}>
                {(endAt) => (
                  <form.Field name="startAt">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Starts at
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="datetime-local"
                            max={endAt || undefined}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) => {
                              const nextStartAt = event.target.value;

                              field.handleChange(nextStartAt);

                              // Keep the window valid when the start moves past
                              // the end that was already picked.
                              if (
                                nextStartAt &&
                                endAt &&
                                nextStartAt >= endAt
                              ) {
                                form.setFieldValue("endAt", "");
                              }
                            }}
                            aria-invalid={isInvalid}
                          />
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                )}
              </form.Subscribe>

              <form.Subscribe selector={(state) => state.values.startAt}>
                {(startAt) => (
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
                            min={startAt || undefined}
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
                            {startAt
                              ? "Must be after the start time — earlier dates are disabled."
                              : "Must be after the start time."}
                          </FieldDescription>
                        </Field>
                      );
                    }}
                  </form.Field>
                )}
              </form.Subscribe>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="eventType">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Event type</FieldLabel>
                      <Select
                        items={EVENT_TYPE_OPTIONS}
                        value={field.state.value || EVENT_TYPES[0]}
                        onValueChange={(value) =>
                          field.handleChange(value ?? EVENT_TYPES[0])
                        }
                      >
                        <SelectTrigger
                          id={field.name}
                          className="w-full"
                          aria-label="Event type"
                        >
                          <SelectValue placeholder="Select an event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
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
                        placeholder="Lake View Resort, Gulshan-2"
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
                        placeholder="Dhaka"
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
                        placeholder="Bangladesh"
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
            </div>
          </FieldGroup>
        </CardContent>
      </form>

      <CardFooter className="justify-end gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={backHref} />}
        >
          Cancel
        </Button>
        <Button type="submit" form="event-form" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner /> Saving
            </>
          ) : existingEvent ? (
            "Save changes"
          ) : (
            "Create event"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function EventFormSkeleton() {
  return (
    <Card size="sm" className="max-w-2xl">
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
