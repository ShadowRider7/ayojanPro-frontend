import type { ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { User } from "./user.type";

export const DISPUTE_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "REJECTED",
  "CLOSED",
] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const DISPUTE_RAISED_BY = ["CLIENT", "PROFESSIONAL"] as const;
export type DisputeRaisedBy = (typeof DISPUTE_RAISED_BY)[number];

export interface DisputeEvidence {
  mediaUrl: string;
  type?: string;
  title?: string;
  description?: string;
}

export interface Dispute {
  id: string;
  contractId: string;
  raisedById: string;
  raisedByRole: DisputeRaisedBy;
  reason: string;
  description: string;
  evidences: DisputeEvidence[];
  status: DisputeStatus;
  resolution: Nullable<string>;
  resolvedById: Nullable<string>;
  resolvedAt: Nullable<ISODateString>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  contract?: Contract;
  raisedBy?: User;
  resolvedBy?: Nullable<User>;
}

export interface RaiseDisputePayload {
  reason: string;
  description: string;
}

export interface UpdateDisputeStatusPayload {
  status: "OPEN" | "UNDER_REVIEW" | "REJECTED" | "CLOSED";
}

export interface ResolveDisputePayload {
  resolution: string;
}
