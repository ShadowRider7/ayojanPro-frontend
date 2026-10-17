export const APP_NAME = "AyojanPro";

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
