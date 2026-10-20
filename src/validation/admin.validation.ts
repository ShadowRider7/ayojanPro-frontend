import { z } from "zod";

/**
 * The rules for an admin decision on a professional application. A rejection
 * needs a reason — it is shown to the applicant.
 */
export const approveProfessionalSchema = z
  .object({
    professionalId: z.string().min(1, "Professional ID is required"),
    status: z.enum(["APPROVED", "REJECTED"], {
      message: "Status must be APPROVED or REJECTED",
    }),
    rejectionReason: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      data.status !== "REJECTED" || (data.rejectionReason?.length ?? 0) > 0,
    {
      message: "Give the professional a reason for the rejection",
      path: ["rejectionReason"],
    },
  );

export type ApproveProfessionalFormValues = z.infer<
  typeof approveProfessionalSchema
>;
