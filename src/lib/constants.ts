import {
  APPLICATION_STATUSES,
  AUTH_PROVIDERS,
  CONTRACT_STATUSES,
  DISPUTE_RAISED_BY,
  DISPUTE_STATUSES,
  EVENT_STATUSES,
  NOTIFICATION_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STAGES,
  PAYMENT_STATUSES,
  PROPOSAL_STATUSES,
  REVIEVEE_ROLES,
  ROLES,
  type Role,
  SERVICE_REQUIREMENT_STATUSES,
  USER_STATUSES,
} from "@/types";
import { humanize } from "@/utils/formatters";

export const APP_NAME = "AyojanPro";

/**
 * Landing path for each role's dashboard after a successful sign-in. Kept here
 * so the header, login and Google sign-in all agree on the same routes.
 */
export const DASHBOARD_ROUTES: Record<Role, string> = {
  CLIENT: "/dashboard",
  PROFESSIONAL: "/dashboard/professional",
  ADMIN: "/dashboard/admin",
};

/**
 * Profile screen for each role that has one. Admins have no profile page, so
 * the map is partial and consumers hide the link when the role is absent.
 */
export const PROFILE_ROUTES: Partial<Record<Role, string>> = {
  CLIENT: "/dashboard/profile",
  PROFESSIONAL: "/dashboard/professional/profile",
};

/** ISO 4217 code for the platform currency (Bangladeshi Taka). */
export const CURRENCY = "BDT";

/** Default page size used by list screens until the API reports otherwise. */
export const DEFAULT_PAGE_SIZE = 10;

/** Client-side maximum for a single upload, in megabytes. */
export const MAX_UPLOAD_SIZE_MB = 5;

export type StatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "destructive";

/**
 * Maps every status value in the backend enums (`EventStatus`,
 * `ServiceRequirementStatus`, `ProposalStatus`, `ContractStatus`,
 * `PaymentStatus`, `DisputeStatus`, `ApplicationStatus`, `UserStatus`) to a
 * visual tone. Unknown values fall back to `neutral`.
 */
export const STATUS_TONES: Record<string, StatusTone> = {
  // Neutral / inactive ends of the lifecycle
  DRAFT: "neutral",
  EXPIRED: "neutral",
  WITHDRAWN: "neutral",
  REFUNDED: "neutral",
  CLOSED: "neutral",
  DELETED: "neutral",

  // Waiting on someone
  PENDING: "warning",
  PROCESSING: "warning",
  UNDER_REVIEW: "warning",
  PARTIALLY_FILLED: "warning",
  PARTIALLY_COMPLETED: "warning",

  // Live / in-flight
  OPEN: "info",
  PUBLISHED: "info",
  IN_PROGRESS: "info",
  DELIVERED: "info",

  // Happy path
  ACTIVE: "success",
  APPROVED: "success",
  ACCEPTED: "success",
  CONFIRMED: "success",
  COMPLETED: "success",
  FILLED: "success",
  RESOLVED: "success",

  // Failure / blocked
  REJECTED: "destructive",
  FAILED: "destructive",
  CANCELLED: "destructive",
  DISPUTED: "destructive",
  BLOCKED: "destructive",
  SUSPENDED: "destructive",
};

/** Resolve a status string to its visual tone. */
export function statusTone(status: string | null | undefined): StatusTone {
  if (!status) {
    return "neutral";
  }

  return STATUS_TONES[status] ?? "neutral";
}

/**
 * A single `{ value, label }` pair for a backend enum, shaped for `<Select>`
 * items and form options.
 */
export type EnumOption<T extends string = string> = {
  value: T;
  label: string;
};

/** Build enum options from one of the `as const` arrays re-exported by `@/types`. */
export function toEnumOptions<T extends string>(
  values: readonly T[],
): EnumOption<T>[] {
  return values.map((value) => ({ value, label: humanize(value) }));
}

/** Look up the human label for an enum value from its options list. */
export function enumLabel<T extends string>(
  options: readonly EnumOption<T>[],
  value: T | null | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  return options.find((option) => option.value === value)?.label;
}

// Enum options shared by forms and selects. Keys mirror the backend enums
// re-exported by `@/types`.
export const ROLE_OPTIONS = toEnumOptions(ROLES);
export const USER_STATUS_OPTIONS = toEnumOptions(USER_STATUSES);
export const AUTH_PROVIDER_OPTIONS = toEnumOptions(AUTH_PROVIDERS);
export const APPLICATION_STATUS_OPTIONS = toEnumOptions(APPLICATION_STATUSES);
export const EVENT_STATUS_OPTIONS = toEnumOptions(EVENT_STATUSES);
export const SERVICE_REQUIREMENT_STATUS_OPTIONS = toEnumOptions(
  SERVICE_REQUIREMENT_STATUSES,
);
export const PROPOSAL_STATUS_OPTIONS = toEnumOptions(PROPOSAL_STATUSES);
export const CONTRACT_STATUS_OPTIONS = toEnumOptions(CONTRACT_STATUSES);
export const PAYMENT_STAGE_OPTIONS = toEnumOptions(PAYMENT_STAGES);
export const PAYMENT_STATUS_OPTIONS = toEnumOptions(PAYMENT_STATUSES);
export const PAYMENT_METHOD_OPTIONS = toEnumOptions(PAYMENT_METHODS);
export const REVIEVEE_ROLE_OPTIONS = toEnumOptions(REVIEVEE_ROLES);
export const DISPUTE_STATUS_OPTIONS = toEnumOptions(DISPUTE_STATUSES);
export const DISPUTE_RAISED_BY_OPTIONS = toEnumOptions(DISPUTE_RAISED_BY);
export const NOTIFICATION_TYPE_OPTIONS = toEnumOptions(NOTIFICATION_TYPES);
