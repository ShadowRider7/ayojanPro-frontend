import { z } from "zod";

const raiseDisputeSchema = z.object({
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

const updateDisputeStatusSchema = z.object({
  status: z.enum(["OPEN", "UNDER_REVIEW", "REJECTED", "CLOSED"], {
    message: "Status must be OPEN, UNDER_REVIEW, REJECTED, or CLOSED",
  }),
});

const resolveDisputeSchema = z.object({
  resolution: z
    .string()
    .min(10, "Please provide a resolution summary")
    .max(5000, "Resolution cannot exceed 5000 characters"),
});

export const disputeValidation = {
  raiseDisputeSchema,
  updateDisputeStatusSchema,
  resolveDisputeSchema,
};
