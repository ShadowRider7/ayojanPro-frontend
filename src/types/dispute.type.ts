import type { ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { User } from "./user.type";

/** Dispute lifecycle (`DisputeStatus` enum). */
export const DISPUTE_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "REJECTED",
  "CLOSED",
] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

/** Which side opened the dispute (`DisputeRaisedBy` enum). */
export const DISPUTE_RAISED_BY = ["CLIENT", "PROFESSIONAL"] as const;
export type DisputeRaisedBy = (typeof DISPUTE_RAISED_BY)[number];

/** One piece of evidence attached to a dispute (`evidences` JSON array). */
export interface DisputeEvidence {
  mediaUrl: string;
  type?: string;
  title?: string;
  description?: string;
}

/** A dispute raised against a contract (`Dispute` model). */
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

/** `POST /dispute/contracts/:id` body — reason + description (evidence files travel as multipart). */
export interface RaiseDisputePayload {
  reason: string;
  description: string;
}

/** `PATCH /dispute/:id/status` body — admin-only non-resolving transitions. */
export interface UpdateDisputeStatusPayload {
  status: "OPEN" | "UNDER_REVIEW" | "REJECTED" | "CLOSED";
}

/** `PATCH /dispute/:id/resolve` body — the resolution summary. */
export interface ResolveDisputePayload {
  resolution: string;
}
