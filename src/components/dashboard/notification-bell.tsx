"use client";

import { BellIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks";

/** Counts above this render as `9+` to keep the badge compact. */
const MAX_BADGE_COUNT = 9;

/**
 * Topbar bell linking to the notifications screen, with an unread-count
 * badge. It shares the `["notifications"]` query family with the list, so
 * marking anything read refreshes both.
 */
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
