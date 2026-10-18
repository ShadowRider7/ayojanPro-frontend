import type { DecimalValue, ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { Proposal, ProposalItem } from "./proposal.type";
import type { Client } from "./user.type";

/** Event lifecycle (`EventStatus` enum). */
export const EVENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

/** Per-requirement fulfilment state (`ServiceRequirementStatus` enum). */
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

/** An event created by a client (`Event` model). */
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

/** `POST /event` body — create an event for the signed-in client. */
export interface CreateEventPayload {
  title: string;
  description?: string;
  eventType?: string;
  city?: string;
  country?: string;
  address?: string;
  /** ISO date string; must be strictly before `endAt`. */
  startAt: string;
  /** ISO date string. */
  endAt: string;
}

/** `PATCH /event/update/:eventId` body. All fields optional; send only what changed. */
export interface UpdateEventPayload {
  title?: string;
  description?: string;
  eventType?: string;
  city?: string;
  country?: string;
  address?: string;
  /** ISO date string; must be strictly before `endAt`. */
  startAt?: string;
  /** ISO date string. */
  endAt?: string;
}

/** `POST /event/services/:eventId` body — one service requirement on an event. */
export interface CreateServiceRequirementPayload {
  serviceName: string;
  description?: string;
  /** Strictly positive. The backend defaults the currency to BDT. */
  budget: number;
  currency?: string;
  /** ISO date string; must fall within the event schedule. */
  startAt: string;
  /** ISO date string; must fall within the event schedule. */
  endAt: string;
}

/** `PATCH /event/update/:eventId/services/:serviceId` body. All fields optional. */
export interface UpdateServiceRequirementPayload {
  serviceName?: string;
  description?: string;
  budget?: number;
  currency?: string;
  startAt?: string;
  endAt?: string;
}

/** A single service a client needs for an event (`EventServiceRequirement` model). */
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
