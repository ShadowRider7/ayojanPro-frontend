/**
 * Backend enums, mirrored 1:1 from `C:\projects\AyojanPro\prisma\schema\enums.prisma`.
 *
 * Each enum is exported both as a runtime `as const` array (for building
 * `z.enum`, `<Select>` options and iteration) and as a string-literal union
 * type (for props and entity fields). Keep this file in sync with the backend.
 */

export const ROLES = ["CLIENT", "PROFESSIONAL", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = [
  "ACTIVE",
  "DELETED",
  "SUSPENDED",
  "BLOCKED",
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const AUTH_PROVIDERS = ["CREDENTIAL", "GOOGLE"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const APPLICATION_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

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

export const PROPOSAL_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "EXPIRED",
] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

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

export const PAYMENT_STAGES = ["INITIAL", "FINAL"] as const;
export type PaymentStage = (typeof PAYMENT_STAGES)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PARTIALLY_COMPLETED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["BKASH"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Who a review is about — kept for parity with the backend enum. */
export const REVIEVEE_ROLES = ["CLIENT", "PROFESSIONAL"] as const;
export type RevieweeRole = (typeof REVIEVEE_ROLES)[number];

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

export const NOTIFICATION_TYPES = [
  "APPLICATION",
  "PROPOSAL",
  "CONTRACT",
  "PAYMENT",
  "SERVICE",
  "REVIEW",
  "DISPUTE",
  "SYSTEM",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
