import z from "zod";

const E164_PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export const updateClientProfileSchema = z.object({
  bio: z.string().trim().max(500, "Bio cannot exceed 500 characters"),
  phone: z
    .string()
    .refine(
      (value) => value.trim() === "" || E164_PHONE_REGEX.test(value.trim()),
      "Please provide a valid phone number (e.g. +8801712345678)",
    ),
  address: z
    .string()
    .trim()
    .refine(
      (value) => value.trim() === "" || value.trim().length >= 2,
      "Address must be at least 2 characters",
    ),
  city: z.string().trim(),
  country: z.string().trim(),
});

export type UpdateClientProfileFormValues = z.infer<
  typeof updateClientProfileSchema
>;
