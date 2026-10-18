import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  CreateEventPayload,
  CreateServiceRequirementPayload,
  Event,
  EventServiceRequirement,
  IPaginated,
  IQuery,
  UpdateEventPayload,
  UpdateServiceRequirementPayload,
} from "@/types";

export function getAllEvents(query: IQuery = {}) {
  return apiClient<ApiResponse<IPaginated<Event>>>("/event/all-events", {
    query,
  });
}

export function getMyEvents() {
  return apiClient<ApiResponse<Event[]>>("/event/my-events");
}

export function createEvent(payload: CreateEventPayload) {
  return apiClient<ApiResponse<Event>>("/event", {
    method: "POST",
    body: payload,
  });
}

export function getEvent(eventId: string) {
  return apiClient<ApiResponse<Event>>(`/event/${eventId}`);
}

export function updateEvent(eventId: string, payload: UpdateEventPayload) {
  return apiClient<ApiResponse<Event>>(`/event/update/${eventId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function getEventRequiredServices(eventId: string) {
  return apiClient<ApiResponse<EventServiceRequirement[]>>(
    `/event/${eventId}/required-services`,
  );
}

export function createEventServiceRequirement(
  eventId: string,
  payload: CreateServiceRequirementPayload,
) {
  return apiClient<ApiResponse<EventServiceRequirement>>(
    `/event/services/${eventId}`,
    { method: "POST", body: payload },
  );
}

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

export function deleteEventServiceRequirement(
  eventId: string,
  serviceId: string,
) {
  return apiClient<ApiResponse<EventServiceRequirement>>(
    `/event/${eventId}/services/${serviceId}`,
    { method: "DELETE" },
  );
}

export function publishEvent(eventId: string) {
  return apiClient<ApiResponse<Event>>(`/event/publish-event/${eventId}`, {
    method: "PATCH",
  });
}

export function deleteEvent(eventId: string) {
  return apiClient<ApiResponse<Event>>(`/event/${eventId}`, {
    method: "DELETE",
  });
}
