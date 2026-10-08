export type UserRole = "ADMIN" | "PROFESSIONAL" | "CLIENT";

export type UserStatus = "ACTIVE" | "DELETED" | "SUSPENDED" | "BLOCKED";

export type AuthProvider = "CREDENTIAL" | "GOOGLE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  authProvider: AuthProvider;
  googleId: string | null;
  emailVerified: boolean;
  needPasswordChange: boolean;
  imageUrl: string | null;
  imagePublicId: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
