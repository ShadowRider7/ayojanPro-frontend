import {
  APPLICATION_STATUSES,
  AUTH_PROVIDERS,
  CONTRACT_STATUSES,
  DISPUTE_RAISED_BY,
  DISPUTE_STATUSES,
  EVENT_STATUSES,
  EVENT_TYPES,
  NOTIFICATION_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STAGES,
  PAYMENT_STATUSES,
  PROPOSAL_STATUSES,
  REFUND_STATUSES,
  REVIEVEE_ROLES,
  ROLES,
  type Role,
  SERVICE_REQUIREMENT_STATUSES,
  USER_STATUSES,
} from "@/types";
import { humanize } from "@/utils/formatters";

export const APP_NAME = "AyojanPro";

export const DASHBOARD_ROUTES: Record<Role, string> = {
  CLIENT: "/dashboard",
  PROFESSIONAL: "/dashboard/professional",
  ADMIN: "/dashboard/admin",
};

export const PROFILE_ROUTES: Partial<Record<Role, string>> = {
  CLIENT: "/dashboard/profile",
  PROFESSIONAL: "/dashboard/professional/profile",
};

export const CURRENCY = "BDT";

export const DEFAULT_PAGE_SIZE = 10;

export const MAX_UPLOAD_SIZE_MB = 5;

export type StatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "destructive";

export const STATUS_TONES: Record<string, StatusTone> = {
  DRAFT: "neutral",
  EXPIRED: "neutral",
  WITHDRAWN: "neutral",
  REFUNDED: "neutral",
  CLOSED: "neutral",
  DELETED: "neutral",

  PENDING: "warning",
  PROCESSING: "warning",
  UNDER_REVIEW: "warning",
  PARTIALLY_FILLED: "warning",
  PARTIALLY_COMPLETED: "warning",

  OPEN: "info",
  PUBLISHED: "info",
  IN_PROGRESS: "info",
  DELIVERED: "info",
  ESCROWED: "info",

  ACTIVE: "success",
  APPROVED: "success",
  ACCEPTED: "success",
  CONFIRMED: "success",
  COMPLETED: "success",
  FILLED: "success",
  RESOLVED: "success",

  REJECTED: "destructive",
  FAILED: "destructive",
  CANCELLED: "destructive",
  DISPUTED: "destructive",
  BLOCKED: "destructive",
  SUSPENDED: "destructive",
};

export function statusTone(status: string | null | undefined): StatusTone {
  if (!status) {
    return "neutral";
  }

  return STATUS_TONES[status] ?? "neutral";
}

export type EnumOption<T extends string = string> = {
  value: T;
  label: string;
};

export function toEnumOptions<T extends string>(
  values: readonly T[],
): EnumOption<T>[] {
  return values.map((value) => ({ value, label: humanize(value) }));
}

export function enumLabel<T extends string>(
  options: readonly EnumOption<T>[],
  value: T | null | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  return options.find((option) => option.value === value)?.label;
}

export const ROLE_OPTIONS = toEnumOptions(ROLES);
export const USER_STATUS_OPTIONS = toEnumOptions(USER_STATUSES);
export const AUTH_PROVIDER_OPTIONS = toEnumOptions(AUTH_PROVIDERS);
export const APPLICATION_STATUS_OPTIONS = toEnumOptions(APPLICATION_STATUSES);
export const EVENT_STATUS_OPTIONS = toEnumOptions(EVENT_STATUSES);
export const EVENT_TYPE_OPTIONS = toEnumOptions(EVENT_TYPES);
export const SERVICE_REQUIREMENT_STATUS_OPTIONS = toEnumOptions(
  SERVICE_REQUIREMENT_STATUSES,
);
export const PROPOSAL_STATUS_OPTIONS = toEnumOptions(PROPOSAL_STATUSES);
export const CONTRACT_STATUS_OPTIONS = toEnumOptions(CONTRACT_STATUSES);
export const PAYMENT_STAGE_OPTIONS = toEnumOptions(PAYMENT_STAGES);
export const PAYMENT_STATUS_OPTIONS = toEnumOptions(PAYMENT_STATUSES);
export const REFUND_STATUS_OPTIONS = toEnumOptions(REFUND_STATUSES);
export const PAYMENT_METHOD_OPTIONS = toEnumOptions(PAYMENT_METHODS);
export const REVIEVEE_ROLE_OPTIONS = toEnumOptions(REVIEVEE_ROLES);
export const DISPUTE_STATUS_OPTIONS = toEnumOptions(DISPUTE_STATUSES);
export const DISPUTE_RAISED_BY_OPTIONS = toEnumOptions(DISPUTE_RAISED_BY);
export const NOTIFICATION_TYPE_OPTIONS = toEnumOptions(NOTIFICATION_TYPES);
