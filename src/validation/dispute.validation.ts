import { z } from "zod";

/**
 * The rules for raising a dispute. The evidence files are part of the form
 * so the "at least one file" rule can be validated on the client too.
 */
export const raiseDisputeSchema = z.object({
  reason: z
    .string()
    .min(3, "Reason must be at least 3 characters")
    .max(255, "Reason cannot exceed 255 characters"),
  description: z
    .string()
    .min(10, "Please describe the issue in more detail")
    .max(5000, "Description cannot exceed 5000 characters"),
  evidence: z
    .array(z.instanceof(File))
    .min(1, "At least one piece of evidence is required"),
});

export type RaiseDisputeFormValues = z.infer<typeof raiseDisputeSchema>;
