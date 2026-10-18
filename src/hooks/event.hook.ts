import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createEvent,
  createEventServiceRequirement,
  deleteEvent,
  deleteEventServiceRequirement,
  getAllEvents,
  getEvent,
  getEventRequiredServices,
  getMyEvents,
  publishEvent,
  updateEvent,
  updateEventServiceRequirement,
} from "@/api";
import type {
  ApiResponse,
  CreateServiceRequirementPayload,
  Event,
  EventServiceRequirement,
  IPaginated,
  IQuery,
  UpdateEventPayload,
  UpdateServiceRequirementPayload,
} from "@/types";

/** The signed-in client's own events, newest first. The endpoint does not paginate. */
export function useMyEvents() {
  return useQuery({
    queryKey: ["events", "my"],
    queryFn: getMyEvents,
  });
}

/**
 * Published events for professionals (`GET /event/all-events`), paginated
 * server-side like the public directory — search and filters live in the
 * query key so each screen state caches separately.
 */
export function usePublishedEvents(query: IQuery) {
  return useQuery<ApiResponse<IPaginated<Event>>>({
    queryKey: ["events", "published", query],
    queryFn: () => getAllEvents(query),
  });
}

/**
 * A single event with its embedded service requirements. Every event query
 * shares the `["events"]` key prefix, so one invalidation refreshes the list
 * screen, the detail screen and the requirement queries together.
 */
export function useEvent(eventId: string) {
  return useQuery<ApiResponse<Event>>({
    queryKey: ["events", eventId],
    queryFn: () => getEvent(eventId),
    enabled: Boolean(eventId),
  });
}

/**
 * The standalone requirement list (`GET /event/:eventId/required-services`)
 * that professionals will browse in T19. The client's own event screens read
 * the requirements embedded in `useEvent` instead, because this endpoint 403s
 * while the event is still a draft.
 */
export function useEventRequiredServices(eventId: string) {
  return useQuery<ApiResponse<EventServiceRequirement[]>>({
    queryKey: ["events", eventId, "requiredServices"],
    queryFn: () => getEventRequiredServices(eventId),
    enabled: Boolean(eventId),
  });
}

export function useCreateEvent() {
  return useMutation({
    mutationFn: createEvent,
  });
}

export function useUpdateEvent() {
  return useMutation({
    mutationFn: (variables: { eventId: string; payload: UpdateEventPayload }) =>
      updateEvent(variables.eventId, variables.payload),
  });
}

export function usePublishEvent() {
  return useMutation({
    mutationFn: publishEvent,
  });
}

export function useDeleteEvent() {
  return useMutation({
    mutationFn: deleteEvent,
  });
}

export function useCreateServiceRequirement() {
  return useMutation({
    mutationFn: (variables: {
      eventId: string;
      payload: CreateServiceRequirementPayload;
    }) => createEventServiceRequirement(variables.eventId, variables.payload),
  });
}

export function useUpdateServiceRequirement() {
  return useMutation({
    mutationFn: (variables: {
      eventId: string;
      serviceId: string;
      payload: UpdateServiceRequirementPayload;
    }) =>
      updateEventServiceRequirement(
        variables.eventId,
        variables.serviceId,
        variables.payload,
      ),
  });
}

export function useDeleteServiceRequirement() {
  return useMutation({
    mutationFn: (variables: { eventId: string; serviceId: string }) =>
      deleteEventServiceRequirement(variables.eventId, variables.serviceId),
  });
}
