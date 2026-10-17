import type { ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { DisputeRaisedBy, DisputeStatus } from "./enums";
import type { User } from "./user.type";

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
