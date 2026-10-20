import { EVENT_TYPES, type EventType } from "@/types";

/** The path of the public events board. */
export const EVENTS_PATH = "/events";

/** The filter value used when no event type is selected. */
export const ALL_EVENT_TYPES = "all";

/**
 * True when the value is one of the event types the platform knows about.
 * The value often comes straight from a URL, so it cannot be trusted.
 */
export function isEventType(
  value: string | null | undefined,
): value is EventType {
  return (
    typeof value === "string" &&
    (EVENT_TYPES as readonly string[]).includes(value)
  );
}

/**
 * The event type to filter by, read from a URL parameter. An unknown value
 * falls back to "no filter" instead of being sent to the API.
 */
export function normalizeEventType(
  value: string | null | undefined,
): EventType | typeof ALL_EVENT_TYPES {
  return isEventType(value) ? value : ALL_EVENT_TYPES;
}

/** The link to the events board filtered by one event type. */
export function eventTypeHref(eventType: string): string {
  return `${EVENTS_PATH}?eventType=${encodeURIComponent(eventType)}`;
}
