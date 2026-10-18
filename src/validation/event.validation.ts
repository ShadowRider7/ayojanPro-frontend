import z from "zod";

/**
 * Event and service-requirement form schemas. Rules mirror the backend
 * `event.validation.ts` (`eventValidator`) so the forms reject the same
 * payloads the API would: title ≤ 255, service name ≤ 150, a strictly
 * positive budget, and `startAt < endAt` on both models. The requirement
 * schema is a function of its host event so the backend's "service dates
 * must be within the event schedule" rule (`eventService.createEventService`)
 * is also explained inline instead of surfacing as the API's 400.
 *
 * Form values stay flat and string-shaped (dates come from `datetime-local`
 * inputs, the budget from a `number` input) so `z.infer` gives the
 * non-optional fields that `defaultValues` needs; ISO strings and numbers are
 * produced in the submit handlers' payload mapping. Every field is required
 * here because both forms always submit complete values — the backend's
 * partial `*Update` schemas serve raw API callers, not these forms.
 */

function parseDate(value: string): Date {
  return new Date(value);
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(parseDate(value).getTime());
}

const requiredDate = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine(isValidDate, `${label} is not a valid date`);

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(255, "Title cannot exceed 255 characters"),
    description: z.string().trim(),
    eventType: z
      .string()
      .trim()
      .max(150, "Event type cannot exceed 150 characters"),
    address: z.string().trim(),
    city: z.string().trim().max(100, "City cannot exceed 100 characters"),
    country: z.string().trim().max(100, "Country cannot exceed 100 characters"),
    startAt: requiredDate("Start time"),
    endAt: requiredDate("End time"),
  })
  .refine(
    (values) =>
      parseDate(values.startAt).getTime() < parseDate(values.endAt).getTime(),
    {
      message: "Event start time must be before its end time",
      path: ["endAt"],
    },
  );

/**
 * The requirement form schema, parameterised by its host event so the
 * backend's "Service dates must be within the event schedule" check
 * (`eventService.createEventService`) is explained inline instead of
 * surfacing as the API's 400. TanStack Form's validator types do not accept
 * an array here, so the schedule rule is a second `.refine` on one schema.
 */
export function serviceRequirementFormSchema(event: {
  startAt: string;
  endAt: string;
}) {
  return z
    .object({
      serviceName: z
        .string()
        .trim()
        .min(1, "Service name is required")
        .max(150, "Service name cannot exceed 150 characters"),
      description: z.string().trim(),
      budget: z
        .string()
        .trim()
        .min(1, "Budget is required")
        .refine((value) => Number(value) > 0, "Budget must be greater than 0"),
      startAt: requiredDate("Start time"),
      endAt: requiredDate("End time"),
    })
    .refine(
      (values) =>
        parseDate(values.startAt).getTime() < parseDate(values.endAt).getTime(),
      {
        message: "Service start time must be before its end time",
        path: ["endAt"],
      },
    )
    .refine(
      (values) =>
        parseDate(values.startAt).getTime() >=
          parseDate(event.startAt).getTime() &&
        parseDate(values.endAt).getTime() <= parseDate(event.endAt).getTime(),
      {
        message: "Service dates must be within the event schedule",
        path: ["endAt"],
      },
    );
}

export type EventFormValues = z.infer<typeof eventFormSchema>;
export type ServiceRequirementFormValues = z.infer<
  ReturnType<typeof serviceRequirementFormSchema>
>;
