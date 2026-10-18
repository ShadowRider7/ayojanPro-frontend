import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  CreateEventPayload,
  CreateServiceRequirementPayload,
  Event,
  EventServiceRequirement,
  UpdateEventPayload,
  UpdateServiceRequirementPayload,
} from "@/types";

/**
 * `GET /event/my-events` — the signed-in client's own events (every status),
 * newest first, each with its `serviceRequirements`. The endpoint does not
 * paginate: `data` is a plain array.
 */
export function getMyEvents() {
  return apiClient<ApiResponse<Event[]>>("/event/my-events");
}

/**
 * `POST /event` — create an event for the signed-in client. It starts as a
 * `DRAFT` and only becomes visible to professionals once published.
 */
export function createEvent(payload: CreateEventPayload) {
  return apiClient<ApiResponse<Event>>("/event", {
    method: "POST",
    body: payload,
  });
}

/**
 * `GET /event/:eventId` — a single event with its client, service
 * requirements (each with its proposals + contracts) and contracts. 404 when
 * the id is unknown or soft-deleted. The embedded `serviceRequirements` are
 * **not** filtered server-side — drop `isDeleted` rows before rendering.
 */
export function getEvent(eventId: string) {
  return apiClient<ApiResponse<Event>>(`/event/${eventId}`);
}

/**
 * `PATCH /event/update/:eventId` — update an own event. The backend rejects
 * the change with a 409 when the event is published and has active contracts,
 * and clamps overlapping requirement dates into the new schedule.
 */
export function updateEvent(eventId: string, payload: UpdateEventPayload) {
  return apiClient<ApiResponse<Event>>(`/event/update/${eventId}`, {
    method: "PATCH",
    body: payload,
  });
}

/**
 * `GET /event/:eventId/required-services` — the standalone requirement list
 * viewers get for a published event (how professionals browse requirements).
 * Rejects `DRAFT`/`CANCELLED` events with a 403, so the client's own event
 * screen reads the requirements embedded in `getEvent` instead.
 */
export function getEventRequiredServices(eventId: string) {
  return apiClient<ApiResponse<EventServiceRequirement[]>>(
    `/event/${eventId}/required-services`,
  );
}

/**
 * `POST /event/services/:eventId` — add a service requirement. The backend
 * requires the requirement's dates to fall within the event schedule.
 */
export function createEventServiceRequirement(
  eventId: string,
  payload: CreateServiceRequirementPayload,
) {
  return apiClient<ApiResponse<EventServiceRequirement>>(
    `/event/services/${eventId}`,
    { method: "POST", body: payload },
  );
}

/** `PATCH /event/update/:eventId/services/:serviceId` — update one requirement. */
export function updateEventServiceRequirement(
  eventId: string,
  serviceId: string,
  payload: UpdateServiceRequirementPayload,
) {
  return apiClient<ApiResponse<EventServiceRequirement>>(
    `/event/update/${eventId}/services/${serviceId}`,
    { method: "PATCH", body: payload },
  );
}

/** `DELETE /event/:eventId/services/:serviceId` — soft-delete one requirement. */
export function deleteEventServiceRequirement(
  eventId: string,
  serviceId: string,
) {
  return apiClient<ApiResponse<EventServiceRequirement>>(
    `/event/${eventId}/services/${serviceId}`,
    { method: "DELETE" },
  );
}

/**
 * `PATCH /event/publish-event/:eventId` — flip a `DRAFT` to `PUBLISHED` so
 * professionals can find the event and submit proposals.
 */
export function publishEvent(eventId: string) {
  return apiClient<ApiResponse<Event>>(`/event/publish-event/${eventId}`, {
    method: "PATCH",
  });
}

/**
 * `DELETE /event/:eventId` — soft-delete an event. The backend rejects the
 * deletion with a 409 when the event is published and has active contracts.
 */
export function deleteEvent(eventId: string) {
  return apiClient<ApiResponse<Event>>(`/event/${eventId}`, {
    method: "DELETE",
  });
}
