import type { ISODateString, Nullable } from "./common.type";
import type { AuthProvider, Role, UserStatus } from "./enums";
import type { Professional } from "./professional.type";

/** A platform account (`User` model). */
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

/** A client profile (`Client` model), one per client `User`. */
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

/**
 * `GET /auth/me` — the session user with whichever profile matches their role.
 * `client` and `professional` are both returned by the API; exactly one is
 * populated for non-admin accounts.
 */
export interface UserProfile extends User {
  client: Client | null;
  professional: Professional | null;
}
