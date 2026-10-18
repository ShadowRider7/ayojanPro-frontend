import type { DecimalValue, ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { Proposal, ProposalItem } from "./proposal.type";
import type { Client } from "./user.type";

export const EVENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const SERVICE_REQUIREMENT_STATUSES = [
  "OPEN",
  "PARTIALLY_FILLED",
  "FILLED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type ServiceRequirementStatus =
  (typeof SERVICE_REQUIREMENT_STATUSES)[number];

export interface Event {
  id: string;
  clientId: string;
  title: string;
  description: Nullable<string>;
  eventType: Nullable<string>;
  address: Nullable<string>;
  city: Nullable<string>;
  country: Nullable<string>;
  startAt: ISODateString;
  endAt: ISODateString;
  isDeleted: boolean;
  deletedAt: Nullable<ISODateString>;
  status: EventStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  client?: Client;
  serviceRequirements?: EventServiceRequirement[];
  proposals?: Proposal[];
  contracts?: Contract[];
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  eventType?: string;
  city?: string;
  country?: string;
  address?: string;

  startAt: string;

  endAt: string;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  eventType?: string;
  city?: string;
  country?: string;
  address?: string;

  startAt?: string;

  endAt?: string;
}

export interface CreateServiceRequirementPayload {
  serviceName: string;
  description?: string;

  budget: number;
  currency?: string;

  startAt: string;

  endAt: string;
}

export interface UpdateServiceRequirementPayload {
  serviceName?: string;
  description?: string;
  budget?: number;
  currency?: string;
  startAt?: string;
  endAt?: string;
}

export interface EventServiceRequirement {
  id: string;
  eventId: string;
  serviceName: string;
  description: Nullable<string>;
  budget: DecimalValue;
  currency: string;
  isDeleted: boolean;
  deletedAt: Nullable<ISODateString>;
  startAt: ISODateString;
  endAt: ISODateString;
  status: ServiceRequirementStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  event?: Event;
  proposalItems?: ProposalItem[];
  contracts?: Contract[];
}
