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

export function splitDeliverableUrls(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const proposalItemFormSchema = z
  .object({
    id: z.string(),
    eventServiceRequirementId: z.string().min(1, "Pick a service requirement"),
    professionalServiceId: z
      .string()
      .min(1, "Pick the service you are offering"),
    proposedAmount: z
      .string()
      .trim()
      .min(1, "Proposed amount is required")
      .refine((value) => Number(value) > 0, "Amount must be greater than 0"),
    proposedStartAt: requiredDate("Start time"),
    proposedEndAt: requiredDate("End time"),
  })
  .refine(
    (values) =>
      parseDate(values.proposedStartAt).getTime() <
      parseDate(values.proposedEndAt).getTime(),
    {
      message: "Start time must be before end time",
      path: ["proposedEndAt"],
    },
  );

export const proposalFormSchema = z.object({
  message: z.string().trim().max(5000, "Message cannot exceed 5000 characters"),
  items: z
    .array(proposalItemFormSchema)
    .min(1, "At least one service item is required")
    .refine(
      (items) =>
        new Set(items.map((item) => item.eventServiceRequirementId)).size ===
        items.length,
      "Cannot offer the same service requirement twice",
    ),
});

export const deliverableFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title cannot exceed 255 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters"),
  externalUrl: z
    .string()
    .trim()
    .min(1, "At least one link is required")
    .refine(
      (value) => splitDeliverableUrls(value).every(isValidHttpUrl),
      "Every line must be a valid link, e.g. https://…",
    ),
});

export type ProposalItemFormValues = z.infer<typeof proposalItemFormSchema>;
export type ProposalFormValues = z.infer<typeof proposalFormSchema>;
export type DeliverableFormValues = z.infer<typeof deliverableFormSchema>;
