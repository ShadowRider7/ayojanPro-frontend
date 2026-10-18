"use client";

import { InboxIcon } from "lucide-react";
import Link from "next/link";
import { DateText, EmptyState, ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks";
import { NOTIFICATION_ICONS } from "../notifications/NotificationList";

const ACTIVITY_LIMIT = 5;

const ACTIVITY_SKELETON_KEYS = [
  "activity-skeleton-0",
  "activity-skeleton-1",
  "activity-skeleton-2",
];

export function RecentActivity() {
  const { data, isPending, isError, error, refetch } = useNotifications();
  const items = (data?.data ?? []).slice(0, ACTIVITY_LIMIT);

  return (
    <Card size="sm" className="gap-2">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/notifications" />}
          >
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <ul className="flex flex-col gap-3">
            {ACTIVITY_SKELETON_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-3 w-14 shrink-0" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <ErrorState
            title="Could not load activity"
            error={error}
            onRetry={refetch}
            className="border-0 py-6"
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="No activity yet"
            description="Updates about your events, proposals, contracts and payments will appear here."
            className="border-0 py-6"
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] ?? InboxIcon;

              return (
                <li key={notification.id} className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm font-medium">
                      {notification.title}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                  <DateText
                    value={notification.createdAt}
                    mode="relative"
                    className="shrink-0 text-xs text-muted-foreground"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
