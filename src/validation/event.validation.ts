import z from "zod";

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
