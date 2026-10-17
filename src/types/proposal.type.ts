import type { DecimalValue, ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { ProposalStatus } from "./enums";
import type { Event, EventServiceRequirement } from "./event.type";
import type { Professional, ProfessionalService } from "./professional.type";

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
