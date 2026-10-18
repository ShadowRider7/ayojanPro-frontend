import type { DecimalValue, ISODateString, Nullable } from "./common.type";
import type { Dispute } from "./dispute.type";
import type { Event, EventServiceRequirement } from "./event.type";
import type { Payment } from "./payment.type";
import type { Professional, ProfessionalService } from "./professional.type";
import type { ProposalItem } from "./proposal.type";
import type { Review } from "./review.type";
import type { Client } from "./user.type";

export const CONTRACT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
  "RESOLVED",
] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export interface Contract {
  id: string;
  clientId: string;
  professionalId: string;
  eventId: string;
  eventServiceRequirementId: string;
  professionalServiceId: string;
  proposalItemId: string;
  agreedAmount: DecimalValue;
  currency: string;
  serviceStartAt: ISODateString;
  serviceEndAt: ISODateString;
  status: ContractStatus;
  terms: Nullable<string>;
  confirmedAt: Nullable<ISODateString>;
  startedAt: Nullable<ISODateString>;
  completedAt: Nullable<ISODateString>;
  cancelledAt: Nullable<ISODateString>;
  cancellationReason: Nullable<string>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  client?: Client;
  professional?: Professional;
  event?: Event;
  eventServiceRequirement?: EventServiceRequirement;
  professionalService?: ProfessionalService;
  proposalItem?: ProposalItem;
  payments?: Payment[];

  deliverables?: Deliverable | null;
  reviews?: Review[];
  disputes?: Dispute[];
}

export interface AttachDeliverablePayload {
  title: string;
  description?: string;

  externalUrl: string;
}

export interface AttachDeliverableResult {
  deliverable: Deliverable;
  contract: Contract;
}

export interface Deliverable {
  id: string;
  contractId: string;
  title: Nullable<string>;
  description: Nullable<string>;
  externalUrl: string[];
  submittedAt: ISODateString;
  updatedAt: ISODateString;
  contract?: Contract;
}

export interface CancelContractPayload {
  reason?: string;
}
