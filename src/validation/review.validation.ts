import z from "zod";

/**
 * Review form schema, mirroring the backend `review.validator.ts`
 * (`ReviewValidation`): a whole-number rating from 1 to 5 and an optional
 * comment up to 2000 characters. The form starts with no stars selected
 * (`rating: 0`), so the backend's "at least 1" rule surfaces as an inline
 * prompt instead of the API's 400.
 */
export const reviewFormSchema = z.object({
  rating: z
    .number("Pick a star rating")
    .int("Pick a star rating")
    .min(1, "Pick a star rating")
    .max(5, "Rating cannot be more than 5"),
  comment: z.string().trim().max(2000, "Comment cannot exceed 2000 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
