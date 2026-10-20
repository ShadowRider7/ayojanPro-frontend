"use client";

import { CalendarIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { DateText, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import type { EventStatus, EventType, ServiceRequirementStatus } from "@/types";
import { eventTypeLabel } from "@/utils";

/**
 * The parts of an event a card renders. Both the public board
 * (`PublicEvent`) and the professional board (`Event`) satisfy it, so the
 * two boards share one card.
 */
export type EventCardEvent = {
  id: string;
  title: string;
  status: EventStatus;
  eventType: EventType;
  city: string | null;
  country: string | null;
  startAt: string;
  endAt: string;
  createdAt: string;
  serviceRequirements?: readonly {
    status: ServiceRequirementStatus;
    isDeleted?: boolean;
  }[];
};

type EventCardProps = {
  event: EventCardEvent;
  /**
   * Where the card links to. The public board and the professional
   * workspace show the same event, but each has its own detail route.
   */
  href: string;
  /** The name of the client who posted the event, when it is known. */
  postedBy?: string;
};

/**
 * A published event on a card. Used by both the public board and the
 * professional workspace so the two stay visually identical.
 */
export function EventCard({ event, href, postedBy }: EventCardProps) {
  const location = [event.city, event.country].filter(Boolean).join(", ");
  // A removed requirement is not part of the event any more.
  const requirements = (event.serviceRequirements ?? []).filter(
    (requirement) => !requirement.isDeleted,
  );
  const openServices = requirements.filter(
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

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="w-fit">
          {eventTypeLabel(event.eventType)}
        </Badge>
        {postedBy ? (
          <span className="text-xs text-muted-foreground">
            Posted by {postedBy}
          </span>
        ) : null}
      </div>

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
            : `${requirements.length} service${
                requirements.length === 1 ? "" : "s"
              } requested`}
        </span>
        <DateText value={event.createdAt} mode="relative" />
      </div>
    </Link>
  );
}
