import type { ProfessionalStatus } from "./professional.auth";
import type { User } from "./user.type";

export interface RegistrationPayload {
  name: string;
  email: string;
  password: string;
  client: {
    phone?: string;
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

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
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

export interface AuthClientProfile {
  id: string;
  phone: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
}

export interface AuthProfessionalProfile {
  id: string;
  status: ProfessionalStatus;
  rejectionReason: string | null;
  acceptingBookings: boolean;
  averageRating: number | null;
  totalReviews: number;
}

export interface AuthUser extends User {
  client: AuthClientProfile | null;
  professional: AuthProfessionalProfile | null;
}
