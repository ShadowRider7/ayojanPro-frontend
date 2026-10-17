import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/api";

/**
 * The current user's notifications. `isRead` narrows the list to unread
 * (`false`) or read (`true`) rows; omit it for everything. Every variant
 * shares the `["notifications"]` key prefix, so one invalidation refreshes
 * the list screen and the topbar unread badge together.
 */
export function useNotifications(isRead?: boolean) {
  return useQuery({
    queryKey: ["notifications", isRead ?? "all"],
    queryFn: () => getNotifications(isRead),
  });
}

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: markNotificationRead,
  });
}

export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: markAllNotificationsRead,
  });
}
