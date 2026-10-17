/**
 * Auth request payloads (`POST /auth/*`). Shapes mirror the backend
 * `auth.interface.ts` / `auth.validation.ts`.
 */

/** `POST /auth/register` — client self-registration. */
export interface RegistrationPayload {
  name: string;
  email: string;
  password: string;
  client: {
    phone?: string;
    profileImage?: string;
    bio?: string;
    address?: string;
    city?: string;
    country?: string;
  };
}

/** `POST /auth/login`. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** `POST /auth/google` — the `idToken` from `@react-oauth/google`. */
export interface GoogleAuthPayload {
  idToken: string;
}

/** `POST /auth/verify-email` — the 6-digit signup OTP. */
export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

/** `POST /auth/forgot-password`. */
export interface ForgotPasswordPayload {
  email: string;
}

/** `POST /auth/reset-password`. */
export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}
