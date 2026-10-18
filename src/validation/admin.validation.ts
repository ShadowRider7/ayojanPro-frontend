import { z } from "zod";

const approveProfessionalSchema = z.object({
  professionalId: z.string().min(1, "Professional ID is required"),
  status: z.enum(["APPROVED", "REJECTED"], {
    message: "Status must be APPROVED or REJECTED",
  }),
  rejectionReason: z.string().optional(),
});

export const adminValidation = {
  approveProfessionalSchema,
};
