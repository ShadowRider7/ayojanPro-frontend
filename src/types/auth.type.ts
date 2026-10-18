import type { Client, User } from "./user.type";

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

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleAuthPayload {
  idToken: string;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;

  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyAccountResponse extends AuthTokens {
  user: User;
  client: Client;
}
