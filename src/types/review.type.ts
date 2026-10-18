import type { ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { Professional } from "./professional.type";
import type { Client } from "./user.type";

export const REVIEVEE_ROLES = ["CLIENT", "PROFESSIONAL"] as const;
export type RevieweeRole = (typeof REVIEVEE_ROLES)[number];

export interface Review {
  id: string;
  contractId: string;
  clientId: string;
  professionalId: string;

  reviewByClient: boolean;
  rating: number;
  comment: Nullable<string>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  contract?: Contract;
  client?: Client;
  professional?: Professional;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
}
