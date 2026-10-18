"use client";

import { BellIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks";

const MAX_BADGE_COUNT = 9;

export function NotificationBell() {
  const { data } = useNotifications(false);

  const unreadCount = data?.data.length ?? 0;

  return (
    <Button
      nativeButton={false}
      variant="ghost"
      size="icon-sm"
      className="relative"
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      render={<Link href="/dashboard/notifications" />}
    >
      <BellIcon />
      {unreadCount > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-medium text-[10px] text-white tabular-nums">
          {unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unreadCount}
        </span>
      ) : null}
    </Button>
  );
}
