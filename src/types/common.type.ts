/**
 * Primitive helpers shared across entity types. Prisma serialises `Decimal`
 * columns to strings over JSON, but aggregate endpoints (analytics) return
 * plain numbers, so monetary values are modelled as `DecimalValue`.
 */

/** A monetary/numeric value as it arrives from the API. */
export type DecimalValue = string | number;

/** ISO-8601 timestamp string, e.g. `2026-10-17T09:30:00.000Z`. */
export type ISODateString = string;

export type Nullable<T> = T | null;

export type SortOrder = "asc" | "desc";

export type JsonPrimitive = string | number | boolean | null;

/** Any JSON-serialisable value (matches a Prisma `Json` column). */
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

/** A JSON object (matches the common Prisma `Json` object shape). */
export type JsonObject = { [key: string]: JsonValue };
