import z from "zod";
import { bdPhoneSchema, emailSchema } from "./auth.validation";

/**
 * Professional application schemas. The application form is flat and
 * form-shaped (like `registrationSchema`); the submit handler maps it onto
 * the nested multipart body of `POST /professional/apply-as-professional`.
 * Text-field rules mirror the backend `professional.validation.ts`
 * `applyAsProfessionalSchema`. The file fields live here too because the form
 * owns them — the API reads them from the multipart body, not the `data` JSON
 * (multer allows one resume and up to ten additional files).
 */
export const professionalApplicationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(255, "Name cannot exceed 255 characters"),
  email: emailSchema,
  phone: bdPhoneSchema,
  professionalTitle: z
    .string()
    .trim()
    .min(2, "Professional title is required")
    .max(255, "Professional title cannot exceed 255 characters"),
  experienceYears: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), "Enter a whole number of years"),
  // The apply endpoint itself imposes no bio limit, but the profile editor
  // (`PATCH /professional/update-my-profile`) caps bios at 500 — match it so
  // nothing applied with here becomes uneditable later.
  bio: z.string().trim().max(500, "Bio cannot exceed 500 characters"),
  city: z.string().trim().max(100, "City name cannot exceed 100 characters"),
  country: z
    .string()
    .trim()
    .max(100, "Country name cannot exceed 100 characters"),
  resume: z.array(z.instanceof(File)).min(1, "Attach your resume"),
  additionalFiles: z
    .array(z.instanceof(File))
    .max(10, "You can attach up to 10 additional files"),
});

export type ProfessionalApplicationFormValues = z.infer<
  typeof professionalApplicationSchema
>;
