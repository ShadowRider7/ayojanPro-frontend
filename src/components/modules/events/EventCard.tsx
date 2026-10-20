"use client";

import { CalendarIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { DateText, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import type { PublicEvent } from "@/types";
import { eventTypeLabel } from "@/utils";

type EventCardProps = {
  event: PublicEvent;
  /**
   * Where the card links to. The public board and the professional
   * workspace show the same event, but each has its own detail route.
   */
  href: string;
};

/**
 * A published event on a card. Used by both the public board and the
 * professional workspace so the two stay visually identical.
 */
export function EventCard({ event, href }: EventCardProps) {
  const location = [event.city, event.country].filter(Boolean).join(", ");
  const openServices = event.serviceRequirements.filter(
    (requirement) =>
      requirement.status === "OPEN" ||
      requirement.status === "PARTIALLY_FILLED",
  ).length;

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-heading leading-snug font-medium group-hover:text-primary">
          {event.title}
        </h2>
        <StatusBadge status={event.status} className="shrink-0" />
      </div>

      <Badge variant="secondary" className="w-fit">
        {eventTypeLabel(event.eventType)}
      </Badge>

      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarIcon className="size-4 shrink-0" />
          <DateText value={event.startAt} /> – <DateText value={event.endAt} />
        </p>
        {location ? (
          <p className="flex items-center gap-2">
            <MapPinIcon className="size-4 shrink-0" />
            {location}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>
          {openServices > 0
            ? `${openServices} service${openServices === 1 ? "" : "s"} open for proposals`
            : `${event.serviceRequirements.length} service${
                event.serviceRequirements.length === 1 ? "" : "s"
              } requested`}
        </span>
        <DateText value={event.createdAt} mode="relative" />
      </div>
    </Link>
  );
}
