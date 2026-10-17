/**
 * Auth request payloads and responses (`POST /auth/*`). Shapes mirror the
 * backend `auth.interface.ts` / `auth.validation.ts` and `auth.controller.ts`.
 */

import type { Client, User } from "./user.type";

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
  /** Required by the backend validation even though the service ignores it. */
  confirmPassword: string;
}

/**
 * Session token pair returned by the auth endpoints. The client never reads
 * them — the backend also sets them as httpOnly cookies — but they are part
 * of the response envelope.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** `POST /auth/verify-email` response — the created account plus its session. */
export interface VerifyAccountResponse extends AuthTokens {
  user: User;
  client: Client;
}
