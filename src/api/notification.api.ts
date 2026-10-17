import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  MarkAllNotificationsReadResult,
  Notification,
} from "@/types";

/**
 * `GET /notification` — the signed-in user's notifications, newest first.
 * `isRead` narrows to read (`true`) or unread (`false`) rows; omit it for
 * every notification. The endpoint does not paginate.
 */
export function getNotifications(isRead?: boolean) {
  return apiClient<ApiResponse<Notification[]>>("/notification", {
    query: isRead === undefined ? undefined : { isRead },
  });
}

/** `PATCH /notification/:id/read` — mark a single notification as read. */
export function markNotificationRead(notificationId: string) {
  return apiClient<ApiResponse<Notification>>(
    `/notification/${notificationId}/read`,
    { method: "PATCH" },
  );
}

/** `PATCH /notification/read-all` — mark every unread notification as read. */
export function markAllNotificationsRead() {
  return apiClient<ApiResponse<MarkAllNotificationsReadResult>>(
    "/notification/read-all",
    { method: "PATCH" },
  );
}
