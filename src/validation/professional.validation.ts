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

function isValidDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

const optionalDate = z
  .string()
  .refine((value) => value === "" || isValidDate(value), "Pick a valid date");

/**
 * Profile-management schemas for T18. Like the application schema above they
 * are flat and form-shaped, and their rules mirror the backend
 * `professional.validation.ts` (`updateProfessionalProfileSchema`,
 * `addServiceSchema`, `addSkillSchema`, `addExperienceSchema`,
 * `CreatePortfolioSchema`): title 2–255 / bio ≤ 500 / city & country ≤ 100,
 * service prices as non-negative numbers, a ≤ 150-char skill name, and the
 * portfolio's required `workDate`. Blank strings mean "no value" — the submit
 * handlers turn them into `null` (clear) or `undefined` (omit) to match each
 * endpoint's nullable/optional rules.
 */
export const updateProfessionalProfileSchema = z.object({
  professionalTitle: z
    .string()
    .trim()
    .min(2, "Professional title is required")
    .max(255, "Professional title cannot exceed 255 characters"),
  experienceYears: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), "Enter a whole number of years"),
  bio: z.string().trim().max(500, "Bio cannot exceed 500 characters"),
  // Stricter than the backend's free-form ≤ 30 chars: the app-wide rule for
  // phone fields is a Bangladeshi mobile number (register + apply use it too).
  phone: bdPhoneSchema,
  address: z.string().trim(),
  city: z.string().trim().max(100, "City name cannot exceed 100 characters"),
  country: z
    .string()
    .trim()
    .max(100, "Country name cannot exceed 100 characters"),
  acceptingBookings: z.boolean(),
});

export type UpdateProfessionalProfileFormValues = z.infer<
  typeof updateProfessionalProfileSchema
>;

const priceString = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (value) => /^\d+(\.\d{1,2})?$/.test(value),
      `Enter a valid ${label.toLowerCase()} (e.g. 25000)`,
    );

export const professionalServiceFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Service name is required")
      .max(150, "Service name cannot exceed 150 characters"),
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters"),
    // Required by the backend (no `.optional()`), though it may be left empty.
    pricingNote: z
      .string()
      .trim()
      .max(1000, "Pricing note cannot exceed 1000 characters"),
    minimumPrice: priceString("Minimum price"),
    maximumPrice: priceString("Maximum price"),
  })
  .refine(
    (values) => Number(values.minimumPrice) <= Number(values.maximumPrice),
    {
      message: "Maximum price must be at least the minimum price",
      path: ["maximumPrice"],
    },
  );

export type ProfessionalServiceFormValues = z.infer<
  typeof professionalServiceFormSchema
>;

/**
 * The inline "add skill" form. Only the name travels — the endpoint accepts
 * an optional description, but there is no field for it on this card.
 */
export const skillFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(150, "Skill name cannot exceed 150 characters"),
});

export type SkillFormValues = z.infer<typeof skillFormSchema>;

export const experienceFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(255, "Title cannot exceed 255 characters"),
    organization: z
      .string()
      .trim()
      .max(255, "Organization cannot exceed 255 characters"),
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters"),
    startDate: optionalDate,
    endDate: optionalDate,
  })
  .refine(
    (values) =>
      values.startDate === "" ||
      values.endDate === "" ||
      new Date(values.startDate).getTime() <=
        new Date(values.endDate).getTime(),
    {
      message: "End date must be on or after the start date",
      path: ["endDate"],
    },
  );

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

const portfolioBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title cannot exceed 255 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters"),
  eventType: z
    .string()
    .trim()
    .max(100, "Event type cannot exceed 100 characters"),
  workDate: z
    .string()
    .min(1, "Work date is required")
    .refine(isValidDate, "Work days must be a valid date"),
  externalUrl: z
    .string()
    .trim()
    .refine((value) => {
      if (value === "") {
        return true;
      }

      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, "Enter a valid URL (e.g. https://…)"),
});

/**
 * Both portfolio forms carry a `mediaFile` field so one form value type fits
 * the two modes; only the create schema requires a non-empty selection.
 */
const portfolioMediaFile = z.array(z.instanceof(File));

/** Edit form: metadata only — `PATCH /portfolio/:id` cannot replace the file. */
export const portfolioFormSchema = portfolioBaseSchema.extend({
  mediaFile: portfolioMediaFile,
});

export type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

/**
 * Create form: the media travels as the multipart `mediaFile` field, so it
 * lives in the schema like the application form's `resume` does.
 */
export const createPortfolioItemSchema = portfolioBaseSchema.extend({
  mediaFile: portfolioMediaFile.min(
    1,
    "Choose a photo for this portfolio item",
  ),
});

export type CreatePortfolioItemFormValues = z.infer<
  typeof createPortfolioItemSchema
>;
