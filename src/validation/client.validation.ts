import z from "zod";

/**
 * Client profile form schema. Rules mirror the backend
 * `client.validation.ts` (`ClientValidation.updateClientProfileSchema`) so the
 * client rejects the same payloads the API would: bio ≤ 500 chars, an
 * E.164-style phone, address ≥ 2 chars when present, and free-text city /
 * country.
 *
 * The schema is flat and required-string shaped (an empty string means "no
 * value") so `z.infer` gives non-optional fields for `defaultValues`. On submit
 * empty strings are dropped from the payload — the backend marks these fields
 * `.optional()`, so an empty value would fail its `min`/`regex` checks.
 */
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
