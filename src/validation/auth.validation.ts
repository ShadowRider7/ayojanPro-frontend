import z from "zod";

export const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;

export const emailSchema = z.email("Please provide a valid email address");

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

export const bdPhoneSchema = z
  .string()
  .refine((value) => value === "" || BD_PHONE_REGEX.test(value), {
    message: "Please provide valid Bangladeshi number",
  })
  .optional();

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
    phone: bdPhoneSchema,
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
