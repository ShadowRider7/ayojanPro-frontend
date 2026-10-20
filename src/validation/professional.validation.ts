import z from "zod";
import { isValidHttpUrl } from "@/utils";
import { emailSchema, optionalPhoneSchema } from "./auth.validation";

export const professionalApplicationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(255, "Name cannot exceed 255 characters"),
  email: emailSchema,
  phone: optionalPhoneSchema,
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
  phone: optionalPhoneSchema,
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
    .refine((value) => value === "" || isValidDate(value), "Pick a valid date"),
  externalUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isValidHttpUrl(value),
      "Enter a valid link, e.g. https://…",
    ),
});

const portfolioMediaFile = z.array(z.instanceof(File));

export const portfolioFormSchema = portfolioBaseSchema.extend({
  mediaFile: portfolioMediaFile,
});

export type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

export const createPortfolioItemSchema = portfolioBaseSchema.extend({
  workDate: portfolioBaseSchema.shape.workDate
    .min(1, "Work date is required")
    .refine(isValidDate, "Work days must be a valid date"),
  mediaFile: portfolioMediaFile.min(
    1,
    "Choose a photo for this portfolio item",
  ),
});

export type CreatePortfolioItemFormValues = z.infer<
  typeof createPortfolioItemSchema
>;
