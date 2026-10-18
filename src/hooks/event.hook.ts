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

export function useMyEvents() {
  return useQuery({
    queryKey: ["events", "my"],
    queryFn: getMyEvents,
  });
}

export function usePublishedEvents(query: IQuery) {
  return useQuery<ApiResponse<IPaginated<Event>>>({
    queryKey: ["events", "published", query],
    queryFn: () => getAllEvents(query),
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
