"use client";

import { ArrowLeftIcon, CalendarSearchIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CurrencyText,
  DateText,
  EmptyState,
  ErrorState,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent, useEventRequiredServices, useMyProposals } from "@/hooks";
import type { Event, EventServiceRequirement, Proposal } from "@/types";
import { ProposalForm } from "./ProposalForm";

const PROPOSABLE_STATUSES = ["OPEN", "PARTIALLY_FILLED"] as const;

const ACTIVE_ITEM_STATUSES = ["PENDING", "ACCEPTED"] as const;

type EventBrowseDetailProps = {
  eventId: string;
};

export function EventBrowseDetail({ eventId }: EventBrowseDetailProps) {
  const eventQuery = useEvent(eventId);
  const requirementsQuery = useEventRequiredServices(eventId);
  const myProposalsQuery = useMyProposals();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRequirementId, setDialogRequirementId] = useState<string | null>(
    null,
  );

  const event = eventQuery.data?.data ?? null;
  const requirements = useMemo(
    () =>
      (requirementsQuery.data?.data ?? []).filter(
        (requirement) => !requirement.isDeleted,
      ),
    [requirementsQuery.data?.data],
  );

  const myProposals = myProposalsQuery.data?.data ?? [];
  const eventProposals = useMemo(
    () => myProposals.filter((proposal) => proposal.eventId === eventId),
    [myProposals, eventId],
  );
  const bidOnRequirementIds = useMemo(
    () =>
      eventProposals
        .flatMap((proposal) => proposal.items ?? [])
        .filter((item) =>
          ACTIVE_ITEM_STATUSES.includes(
            item.status as (typeof ACTIVE_ITEM_STATUSES)[number],
          ),
        )
        .map((item) => item.eventServiceRequirementId),
    [eventProposals],
  );
  const proposableRequirements = requirements.filter(
    (requirement) =>
      PROPOSABLE_STATUSES.includes(
        requirement.status as (typeof PROPOSABLE_STATUSES)[number],
      ) && !bidOnRequirementIds.includes(requirement.id),
  );

  const isPending = eventQuery.isPending || requirementsQuery.isPending;
  const isError = eventQuery.isError || requirementsQuery.isError;
  const requirementsError = requirementsQuery.error as Error | undefined;
  const requirementsRefetch = () => requirementsQuery.refetch();

  const openDialog = (requirementId: string | null) => {
    setDialogRequirementId(requirementId);
    setDialogOpen(true);
  };

  if (isPending) {
    return <EventBrowseDetailSkeleton />;
  }

  if (isError || !event) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorState
          title="Could not load this event"
          description={
            requirementsQuery.error?.message.includes("not published")
              ? "This event is no longer available to professionals."
              : undefined
          }
          error={eventQuery.error ?? requirementsQuery.error}
          onRetry={() => {
            eventQuery.refetch();
            requirementsQuery.refetch();
          }}
        />
        <Button
          variant="outline"
          render={
            <Link href="/dashboard/professional/browse-events">
              <ArrowLeftIcon /> Back to browse events
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={event.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              <DateText value={event.startAt} /> –{" "}
              <DateText value={event.endAt} />
            </span>
            <StatusBadge status={event.status} />
          </span>
        }
      >
        <Button
          variant="outline"
          render={
            <Link href="/dashboard/professional/browse-events">
              <ArrowLeftIcon /> Back to browse
            </Link>
          }
        />
        <Button
          disabled={proposableRequirements.length === 0}
          onClick={() => openDialog(null)}
        >
          <SendIcon /> Send proposal
        </Button>
      </PageHeader>

      <EventSummaryCard event={event} />

      {eventProposals.length > 0 ? (
        <MyProposalsForEventCard proposals={eventProposals} />
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold">
            Services requested
          </h2>
          <p className="text-sm text-muted-foreground">
            Quote your own amount and schedule for each service — one proposal
            can cover several of them at once.
          </p>
        </div>

        {requirementsQuery.isPending ? (
          <Skeleton className="h-32 w-full" />
        ) : requirementsQuery.isError ? (
          <ErrorState
            title="Could not load the requested services"
            error={requirementsError}
            onRetry={requirementsRefetch}
          />
        ) : requirements.length === 0 ? (
          <EmptyState
            icon={CalendarSearchIcon}
            title="No services requested yet"
            description="The client published this event without service requirements. Nothing to propose on for now."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {requirements.map((requirement) => (
              <li key={requirement.id}>
                <RequirementCard
                  requirement={requirement}
                  alreadyBid={bidOnRequirementIds.includes(requirement.id)}
                  onPropose={() => openDialog(requirement.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {event ? (
        <ProposalForm
          key={dialogRequirementId ?? "new-proposal"}
          event={event}
          requirements={proposableRequirements}
          bidOnRequirementIds={bidOnRequirementIds}
          initialRequirementId={dialogRequirementId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      ) : null}
    </div>
  );
}

function EventSummaryCard({ event }: { event: Event }) {
  const location = [event.city, event.country].filter(Boolean).join(", ");

  return (
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
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Schedule
            </p>
            <p className="text-sm">
              <DateText value={event.startAt} mode="datetime" /> –{" "}
              <DateText value={event.endAt} mode="datetime" />
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Location
            </p>
            <p className="text-sm">{location || "Not specified"}</p>
          </div>
          {event.eventType ? (
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Event type
              </p>
              <p className="text-sm">{event.eventType}</p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function RequirementCard({
  requirement,
  alreadyBid,
  onPropose,
}: {
  requirement: EventServiceRequirement;
  alreadyBid: boolean;
  onPropose: () => void;
}) {
  const isProposable =
    PROPOSABLE_STATUSES.includes(
      requirement.status as (typeof PROPOSABLE_STATUSES)[number],
    ) && !alreadyBid;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{requirement.serviceName}</p>
            <StatusBadge status={requirement.status} />
            {alreadyBid ? (
              <Badge variant="secondary" className="w-fit">
                You already proposed
              </Badge>
            ) : null}
          </div>
          {requirement.description ? (
            <p className="text-sm text-muted-foreground">
              {requirement.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-0.5 text-right">
          <p className="text-xs text-muted-foreground">Budget</p>
          <CurrencyText
            value={requirement.budget}
            currency={requirement.currency}
            className="font-semibold"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span>
          <DateText value={requirement.startAt} mode="datetime" /> –{" "}
          <DateText value={requirement.endAt} mode="datetime" />
        </span>
        {isProposable ? (
          <Button size="sm" onClick={onPropose}>
            <SendIcon /> Propose
          </Button>
        ) : (
          <span>
            {alreadyBid
              ? "Waiting on the client's response"
              : "No longer open for proposals"}
          </span>
        )}
      </div>
    </div>
  );
}

function MyProposalsForEventCard({ proposals }: { proposals: Proposal[] }) {
  const pendingCount = proposals.filter((proposal) =>
    (proposal.items ?? []).some((item) => item.status === "PENDING"),
  ).length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed bg-muted/40 p-4">
      <div className="flex flex-col gap-0.5 text-sm">
        <p className="font-medium">
          You already sent{" "}
          {proposals.length === 1
            ? "a proposal"
            : `${proposals.length} proposals`}{" "}
          for this event
        </p>
        <p className="text-muted-foreground">
          {pendingCount > 0
            ? `${pendingCount} awaiting the client's response.`
            : "The client has responded to all of them."}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        render={
          <Link href="/dashboard/professional/proposals">My proposals</Link>
        }
      />
    </div>
  );
}

function EventBrowseDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}
