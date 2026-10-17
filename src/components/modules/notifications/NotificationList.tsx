"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  BellIcon,
  BriefcaseIcon,
  CheckCheckIcon,
  FileSignatureIcon,
  FileTextIcon,
  InboxIcon,
  StarIcon,
  TriangleAlertIcon,
  UserPlusIcon,
  WalletIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  DateText,
  EmptyState,
  ErrorState,
  PageHeader,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks";
import { enumLabel, NOTIFICATION_TYPE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types";

type Filter = "all" | "unread";

/** Stable keys for the loading placeholder rows. */
const SKELETON_KEYS = [
  "notification-skeleton-0",
  "notification-skeleton-1",
  "notification-skeleton-2",
];

const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  APPLICATION: UserPlusIcon,
  PROPOSAL: FileTextIcon,
  CONTRACT: FileSignatureIcon,
  PAYMENT: WalletIcon,
  SERVICE: BriefcaseIcon,
  REVIEW: StarIcon,
  DISPUTE: TriangleAlertIcon,
  SYSTEM: BellIcon,
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
];

function NotificationRow({
  notification,
  onMarkRead,
  isMarkingRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  isMarkingRead: boolean;
}) {
  const Icon = NOTIFICATION_ICONS[notification.type] ?? BellIcon;
  const isUnread = !notification.isRead;

  return (
    <li
      className={cn(
        "flex gap-3 rounded-xl border p-4 transition-colors",
        isUnread && "border-primary/20 bg-primary/5",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
          isUnread && "bg-primary/10 text-primary",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <p className="font-medium">{notification.title}</p>
          <DateText
            value={notification.createdAt}
            mode="relative"
            className="text-muted-foreground text-xs"
          />
        </div>
        <p className="text-muted-foreground text-sm">{notification.message}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {enumLabel(NOTIFICATION_TYPE_OPTIONS, notification.type) ??
              notification.type}
          </Badge>
          {isUnread ? (
            <Button
              variant="ghost"
              size="xs"
              disabled={isMarkingRead}
              onClick={() => onMarkRead(notification.id)}
            >
              {isMarkingRead ? "Marking…" : "Mark as read"}
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/**
 * `/dashboard/notifications` — the signed-in user's notifications with an
 * all/unread filter, per-item and mark-all read actions, and an unread count
 * shared with the topbar bell (both live under `["notifications"]`).
 */
export function NotificationList() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isPending, isError, error, refetch } = useNotifications(
    filter === "unread" ? false : undefined,
  );
  const {
    mutate: markRead,
    isPending: isMarkingOne,
    variables,
  } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } =
    useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const invalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  const handleMarkRead = useCallback(
    (id: string) => {
      markRead(id, {
        onSuccess: invalidateNotifications,
        onError: (err) => {
          toast.add({
            title: "Could not update notification",
            description: err.message || "Please try again in a moment.",
            type: "error",
          });
        },
      });
    },
    [markRead, invalidateNotifications],
  );

  const handleMarkAllRead = useCallback(() => {
    markAllRead(undefined, {
      onSuccess: () => {
        toast.add({
          title: "All notifications marked as read",
          type: "success",
        });
        invalidateNotifications();
      },
      onError: (err) => {
        toast.add({
          title: "Could not update notifications",
          description: err.message || "Please try again in a moment.",
          type: "error",
        });
      },
    });
  }, [markAllRead, invalidateNotifications]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Updates about your events, proposals, contracts and payments."
      >
        <Button
          variant="outline"
          disabled={unreadCount === 0 || isMarkingAll}
          onClick={handleMarkAllRead}
        >
          <CheckCheckIcon />
          {isMarkingAll ? "Marking…" : "Mark all as read"}
        </Button>
      </PageHeader>

      {/* biome-ignore lint/a11y/useSemanticElements: segmented filter control; role="group" is intentional */}
      <div
        role="group"
        aria-label="Filter notifications"
        className="flex w-fit items-center gap-1 rounded-lg bg-muted p-1"
      >
        {FILTERS.map((item) => {
          const isActive = filter === item.value;

          return (
            <Button
              key={item.value}
              variant="ghost"
              size="sm"
              aria-pressed={isActive}
              className={cn(isActive && "bg-background shadow-sm")}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
              {item.value === "unread" && unreadCount > 0
                ? ` (${unreadCount})`
                : ""}
            </Button>
          );
        })}
      </div>

      {isPending ? (
        <ul className="flex flex-col gap-3">
          {SKELETON_KEYS.map((key) => (
            <li key={key} className="flex gap-3 rounded-xl border p-4">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-24" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <ErrorState
          title="Could not load notifications"
          error={error}
          onRetry={refetch}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title={
            filter === "unread"
              ? "No unread notifications"
              : "No notifications yet"
          }
          description={
            filter === "unread"
              ? "You are all caught up — new updates will appear here."
              : "Updates about your events, proposals, contracts and payments will appear here."
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              isMarkingRead={isMarkingOne && variables === notification.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
