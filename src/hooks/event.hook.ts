import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  createEventServiceRequirement,
  deleteEvent,
  deleteEventServiceRequirement,
  getAllEvents,
  getEvent,
  getEventRequiredServices,
  getMyEvents,
  getPublishedEvent,
  getPublishedEvents,
  publishEvent,
  updateEvent,
  updateEventServiceRequirement,
} from "@/api";
import type {
  ApiResponse,
  CreateServiceRequirementPayload,
  Event,
  EventServiceRequirement,
  IQuery,
  PublicEvent,
  UpdateEventPayload,
  UpdateServiceRequirementPayload,
} from "@/types";

export function useMyEvents() {
  return useQuery({
    queryKey: ["events", "my"],
    queryFn: getMyEvents,
  });
}

export function usePublishedEvents(query: IQuery) {
  return useQuery<ApiResponse<Event[]>>({
    queryKey: ["events", "published", query],
    queryFn: () => getAllEvents(query),
  });
}

/**
 * The public events board. No auth required, so it is usable by a professional
 * whose application has not been approved yet.
 */
export function usePublicEvents(query: IQuery) {
  return useQuery<ApiResponse<PublicEvent[]>>({
    queryKey: ["events", "board", query],
    queryFn: () => getPublishedEvents(query),
  });
}

export function usePublicEvent(eventId: string) {
  return useQuery<ApiResponse<PublicEvent>>({
    queryKey: ["events", "board", eventId],
    queryFn: () => getPublishedEvent(eventId),
    enabled: Boolean(eventId),
  });
}

export function useEvent(eventId: string) {
  return useQuery<ApiResponse<Event>>({
    queryKey: ["events", eventId],
    queryFn: () => getEvent(eventId),
    enabled: Boolean(eventId),
  });
}

export function useEventRequiredServices(eventId: string) {
  return useQuery<ApiResponse<EventServiceRequirement[]>>({
    queryKey: ["events", eventId, "requiredServices"],
    queryFn: () => getEventRequiredServices(eventId),
    enabled: Boolean(eventId),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { eventId: string; payload: UpdateEventPayload }) =>
      updateEvent(variables.eventId, variables.payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["events", variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["events", "my"] });
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useCreateServiceRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      eventId: string;
      payload: CreateServiceRequirementPayload;
    }) => createEventServiceRequirement(variables.eventId, variables.payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["events", variables.eventId],
      });
    },
  });
}

export function useUpdateServiceRequirement() {
  const queryClient = useQueryClient();
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["events", variables.eventId],
      });
    },
  });
}

export function useDeleteServiceRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { eventId: string; serviceId: string }) =>
      deleteEventServiceRequirement(variables.eventId, variables.serviceId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["events", variables.eventId],
      });
    },
  });
}
