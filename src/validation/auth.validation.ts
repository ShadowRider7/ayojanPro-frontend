import z from "zod";
import { isValidPhone } from "@/utils";

/**
 * The email field. The value is trimmed first, so a pasted address with
 * surrounding spaces is accepted and sent trimmed.
 */
export const emailSchema = z
  .string()
  .trim()
  .pipe(z.email("Please provide a valid email address"));

export const passwordSchema = z
  .string()
  .min(8, "Password Must Minimum 8 Characters Long.")
  .regex(/[a-z]/, "Password must contain at least 1 Lowercase Letter")
  .regex(/[A-Z]/, "Password must contain at least 1 Uppercase Letter")
  .regex(/[0-9]/, "Password must contain at least 1 Number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 Special Character");

export const otpSchema = z
  .string()
  .regex(/^\d{6}$/, "OTP must be a 6-digit number");

export const phoneFieldSchema = z
  .string()
  .refine((value) => value === "" || isValidPhone(value), {
    message: "Please provide a valid phone number",
  });

export const optionalPhoneSchema = phoneFieldSchema.optional();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(255, "Name cannot exceed 255 characters"),
    email: emailSchema,
    phone: optionalPhoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyAccountSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    otp: otpSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
