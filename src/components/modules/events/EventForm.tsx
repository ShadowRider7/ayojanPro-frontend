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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateEvent, useEvent, useUpdateEvent } from "@/hooks";
import type { CreateEventPayload, Event } from "@/types";
import { toDateTimeLocal } from "@/utils/formatters";
import { type EventFormValues, eventFormSchema } from "@/validation";

type EventFormProps = {
  /** Present in edit mode (`/dashboard/events/[eventId]/edit`); omit to create. */
  eventId?: string;
};

/** Map the `Event` row onto the flat, string-shaped form values. */
function seedForm(existingEvent: Event | null): EventFormValues {
  return {
    title: existingEvent?.title ?? "",
    description: existingEvent?.description ?? "",
    eventType: existingEvent?.eventType ?? "",
    address: existingEvent?.address ?? "",
    city: existingEvent?.city ?? "",
    country: existingEvent?.country ?? "",
    startAt: toDateTimeLocal(existingEvent?.startAt),
    endAt: toDateTimeLocal(existingEvent?.endAt),
  };
}

/**
 * `/dashboard/events/new` and `/dashboard/events/[eventId]/edit` — one form
 * for both: create posts `POST /event`, edit seeds every field from the
 * loaded event and sends the complete payload to `PATCH /event/update/:eventId`.
 * The form always submits every field, so the schema's required rules apply
 * in both modes; the backend treats omitted fields as unchanged.
 */
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
    validators: {
      onSubmit: eventFormSchema,
    },
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
                        Must be after the start time.
                      </FieldDescription>
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="eventType">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Event type</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="Wedding"
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
        <Button variant="outline" render={<Link href={backHref} />}>
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

/** Mirrors the form card while the event resolves in edit mode. */
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
