import type { ISODateString, Nullable } from "./common.type";
import type { Professional } from "./professional.type";

export const ROLES = ["CLIENT", "PROFESSIONAL", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = [
  "ACTIVE",
  "DELETED",
  "SUSPENDED",
  "BLOCKED",
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const AUTH_PROVIDERS = ["CREDENTIAL", "GOOGLE"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  authProvider: AuthProvider;
  googleId: Nullable<string>;
  emailVerified: boolean;
  needPasswordChange: boolean;
  imageUrl: Nullable<string>;
  imagePublicId: Nullable<string>;
  isDeleted: boolean;
  deletedAt: Nullable<ISODateString>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Client {
  id: string;
  userId: string;
  phone: Nullable<string>;
  bio: Nullable<string>;
  address: Nullable<string>;
  city: Nullable<string>;
  country: Nullable<string>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  user?: User;
}

export interface UserProfile extends User {
  client: Client | null;
  professional: Professional | null;
}

export interface UpdateClientProfilePayload {
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}
