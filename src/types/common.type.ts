export type DecimalValue = string | number;

export type ISODateString = string;

export type Nullable<T> = T | null;

export type SortOrder = "asc" | "desc";

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };
