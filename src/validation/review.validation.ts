import z from "zod";

export const reviewFormSchema = z.object({
  rating: z
    .number("Pick a star rating")
    .int("Pick a star rating")
    .min(1, "Pick a star rating")
    .max(5, "Rating cannot be more than 5"),
  comment: z.string().trim().max(2000, "Comment cannot exceed 2000 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
