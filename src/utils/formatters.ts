const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "BDT";
const EMPTY = "—";

type NumericInput = number | string | null | undefined;
type DateInput = string | number | Date | null | undefined;

/** Parse a number-ish API value (Prisma `Decimal` often serialises to string). */
export function toNumber(value: NumericInput): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "string" ? Number(value) : value;

  return Number.isFinite(parsed) ? parsed : null;
}

type CurrencyOptions = {
  currency?: string;
  locale?: string;
  maximumFractionDigits?: number;
};

/** Format a monetary amount, defaulting to BDT (`৳`). */
export function formatCurrency(
  value: NumericInput,
  options: CurrencyOptions = {},
): string {
  const amount = toNumber(value);

  if (amount === null) {
    return EMPTY;
  }

  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits,
  }).format(amount);
}

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a date as e.g. `17 Oct 2026`. */
export function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = toDate(value);

  if (!date) {
    return EMPTY;
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

/** Format a date + time as e.g. `17 Oct 2026, 2:30 PM`. */
export function formatDateTime(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = toDate(value);

  if (!date) {
    return EMPTY;
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  }).format(date);
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
  ["second", 1000],
];

/** Format a date relative to now, e.g. `2 days ago`. */
export function formatRelativeTime(value: DateInput): string {
  const date = toDate(value);

  if (!date) {
    return EMPTY;
  }

  const formatter = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, {
    numeric: "auto",
  });
  const deltaMs = date.getTime() - Date.now();

  for (const [unit, unitMs] of RELATIVE_UNITS) {
    if (Math.abs(deltaMs) >= unitMs || unit === "second") {
      return formatter.format(Math.round(deltaMs / unitMs), unit);
    }
  }

  return EMPTY;
}

/** First letters of the first two name words, for avatar fallbacks. */
export function initials(name: string | null | undefined): string {
  return (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/**
 * Format a timestamp for a `datetime-local` input, e.g. `2026-10-18T14:30`.
 * The input works in the viewer's local time, so this is the inverse of
 * `new Date(inputValue)`.
 */
export function toDateTimeLocal(value: DateInput): string {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Title-case an enum-like value, e.g. `IN_PROGRESS` → `In Progress`. */
export function humanize(value: string | null | undefined): string {
  if (!value) {
    return EMPTY;
  }

  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
