import type { ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { Professional } from "./professional.type";
import type { Client } from "./user.type";

/** Who a review is about (`RevieweeRole` enum; note the backend spelling). */
export const REVIEVEE_ROLES = ["CLIENT", "PROFESSIONAL"] as const;
export type RevieweeRole = (typeof REVIEVEE_ROLES)[number];

/** A review left on a completed contract (`Review` model). */
export interface Review {
  id: string;
  contractId: string;
  clientId: string;
  professionalId: string;
  /** `true` when the client reviewed the professional, `false` the reverse. */
  reviewByClient: boolean;
  rating: number;
  comment: Nullable<string>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  contract?: Contract;
  client?: Client;
  professional?: Professional;
}
