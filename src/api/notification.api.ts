import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  MarkAllNotificationsReadResult,
  Notification,
} from "@/types";

export function getNotifications(isRead?: boolean) {
  return apiClient<ApiResponse<Notification[]>>("/notification", {
    query: isRead === undefined ? undefined : { isRead },
  });
}

export function markNotificationRead(notificationId: string) {
  return apiClient<ApiResponse<Notification>>(
    `/notification/${notificationId}/read`,
    { method: "PATCH" },
  );
}

export function markAllNotificationsRead() {
  return apiClient<ApiResponse<MarkAllNotificationsReadResult>>(
    "/notification/read-all",
    { method: "PATCH" },
  );
}
