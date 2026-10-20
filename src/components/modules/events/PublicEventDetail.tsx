"use client";

import { CalendarIcon, MapPinIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import {
  Container,
  CurrencyText,
  DateText,
  EmptyState,
  ErrorState,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe, usePublicEvent } from "@/hooks";
import { eventTypeLabel } from "@/utils";

type PublicEventDetailProps = {
  eventId: string;
};

/**
 * The public view of a published event.
 *
 * Anyone can read it, which is how a professional finds out what work is
 * available before they sign in. Sending a proposal needs an account, so the
 * call to action depends on who is looking.
 */
export default function PublicEventDetail({ eventId }: PublicEventDetailProps) {
  const { data, isPending, isError, error, refetch } = usePublicEvent(eventId);
  const { data: me } = useGetMe();

  const event = data?.data ?? null;
  const user = me?.data;
  const isProfessional = user?.role === "PROFESSIONAL";

  if (isPending) {
    return <PublicEventDetailSkeleton />;
  }

  if (isError || !event) {
    return (
      <Container className="py-12 sm:py-16">
        <ErrorState
          title="Could not load this event"
          description="This event is no longer available."
          error={error}
          onRetry={refetch}
        />
      </Container>
    );
  }

  const location = [event.city, event.country].filter(Boolean).join(", ");
  const requirements = event.serviceRequirements;

  return (
    <section className="py-12 sm:py-16">
      <Container className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Link
            href="/events"
            className="w-fit text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Back to all events
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {event.title}
            </h1>
            <StatusBadge status={event.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{eventTypeLabel(event.eventType)}</Badge>
            {event.client?.user ? (
              <span className="text-sm text-muted-foreground">
                Posted by {event.client.user.name}
              </span>
            ) : null}
          </div>
        </div>

        <Card size="sm">
          <CardContent className="flex flex-col gap-4">
            {event.description ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Description
                </p>
                <p className="text-sm">{event.description}</p>
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Schedule
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="size-4 shrink-0" />
                  <DateText value={event.startAt} mode="datetime" /> –{" "}
                  <DateText value={event.endAt} mode="datetime" />
                </p>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Location
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <MapPinIcon className="size-4 shrink-0" />
                  {location || "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-lg font-semibold">
              Services requested
            </h2>
            <p className="text-sm text-muted-foreground">
              The services this event is looking for. A professional sends one
              proposal per service they offer.
            </p>
          </div>

          {requirements.length === 0 ? (
            <EmptyState
              title="No services requested yet"
              description="The client published this event without service requirements. Nothing to propose on for now."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {requirements.map((requirement) => (
                <li
                  key={requirement.id}
                  className="flex flex-col gap-2 rounded-xl border bg-card p-4 ring-1 ring-foreground/10 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{requirement.serviceName}</p>
                    {requirement.description ? (
                      <p className="text-sm text-muted-foreground">
                        {requirement.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-start gap-0.5 sm:items-end">
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <CurrencyText
                      value={requirement.budget}
                      currency={requirement.currency}
                      className="font-semibold"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed bg-muted/40 p-4">
          <div className="flex flex-col gap-1">
            <p className="font-medium">
              {isProfessional
                ? "Interested in this event?"
                : "Are you a professional?"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isProfessional
                ? "Open the event in your workspace to send a proposal for the services you offer."
                : "Sign in as a professional to send a proposal for the services you offer."}
            </p>
          </div>
          <Button
            className="ml-auto"
            nativeButton={false}
            render={
              <Link
                href={
                  isProfessional
                    ? `/dashboard/professional/browse-events/${event.id}`
                    : "/apply-as-professional"
                }
              />
            }
          >
            <SendIcon />
            {isProfessional ? "Open in workspace" : "Apply as a professional"}
          </Button>
        </div>
      </Container>
    </section>
  );
}

function PublicEventDetailSkeleton() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
      </Container>
    </section>
  );
}
