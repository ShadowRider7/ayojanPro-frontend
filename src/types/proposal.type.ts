import type { DecimalValue, ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { Event, EventServiceRequirement } from "./event.type";
import type { Professional, ProfessionalService } from "./professional.type";

/** Proposal/item review state (`ProposalStatus` enum). */
export const PROPOSAL_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "EXPIRED",
] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

/** A professional's offer for an event (`Proposal` model). */
export interface Proposal {
  id: string;
  professionalId: string;
  eventId: string;
  message: Nullable<string>;
  submittedAt: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  professional?: Professional;
  event?: Event;
  items?: ProposalItem[];
}

/** One line of a proposal, tied to a service requirement (`ProposalItem` model). */
export interface ProposalItem {
  id: string;
  proposalId: string;
  eventServiceRequirementId: string;
  professionalServiceId: string;
  proposedAmount: DecimalValue;
  currency: string;
  proposedStartAt: ISODateString;
  proposedEndAt: ISODateString;
  status: ProposalStatus;
  respondedAt: Nullable<ISODateString>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  proposal?: Proposal;
  eventServiceRequirement?: EventServiceRequirement;
  professionalService?: ProfessionalService;
  contract?: Contract | null;
}

/** One requirement line a professional offers for when creating a proposal. */
export interface ProposalItemInput {
  eventServiceRequirementId: string;
  professionalServiceId: string;
  proposedAmount: number;
  proposedStartAt: string;
  proposedEndAt: string;
}

/** Body for `POST /proposal/events/:eventId` (professional, multi-item). */
export interface CreateProposalPayload {
  eventId: string;
  items: ProposalItemInput[];
  message?: string;
}
