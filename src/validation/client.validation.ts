import z from "zod";
import { phoneFieldSchema } from "./auth.validation";

export const updateClientProfileSchema = z.object({
  bio: z.string().trim().max(500, "Bio cannot exceed 500 characters"),
  phone: phoneFieldSchema,
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
