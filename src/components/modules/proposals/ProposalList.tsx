"use client";

import { ArrowLeftIcon, InboxIcon, StarIcon } from "lucide-react";
import Link from "next/link";
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
import { useEvent, useRequirementProposals } from "@/hooks";
import type { Event, EventServiceRequirement, Proposal } from "@/types";
import { toNumber } from "@/utils";

type ProposalListProps = {
  eventId: string;
  requirementId: string;
};

/**
 * `/dashboard/events/[eventId]/requirements/[requirementId]/proposals` — the
 * proposals that bid on one service requirement. The requirement context
 * comes from the host event (cached on the event detail screen), because the
 * proposal endpoint never echoes the requirement itself when a requirement
 * has no proposals yet. Accept/reject live on the proposal detail screen,
 * where every item of the proposal is visible — they cascade over the whole
 * proposal, not just this requirement's item.
 */
export function ProposalList({ eventId, requirementId }: ProposalListProps) {
  const {
    data: eventData,
    isPending: isEventPending,
    isError: isEventError,
    error: eventError,
    refetch: refetchEvent,
  } = useEvent(eventId);
  const { data, isPending, isError, error, refetch } =
    useRequirementProposals(requirementId);

  const event = eventData?.data ?? null;
  const proposals = data?.data ?? [];

  if (isEventPending || isPending) {
    return <ProposalListSkeleton />;
  }

  if (isEventError || !event) {
    return (
      <ErrorState
        title="Could not load this requirement"
        error={eventError}
        onRetry={refetchEvent}
      />
    );
  }

  const requirement = findRequirement(event, requirementId);

  if (!requirement || requirement.isDeleted) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorState
          title="Requirement not found"
          description="This service requirement no longer exists on the event."
        />
        <Button
          variant="outline"
          render={
            <Link href={`/dashboard/events/${eventId}`}>
              <ArrowLeftIcon /> Back to event
            </Link>
          }
        />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load the proposals"
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Proposals"
        description={
          <span>
            Proposals professionals submitted for{" "}
            <span className="font-medium text-foreground">
              {requirement.serviceName}
            </span>
          </span>
        }
      >
        <Button
          variant="outline"
          render={
            <Link href={`/dashboard/events/${eventId}`}>
              <ArrowLeftIcon /> Back to event
            </Link>
          }
        />
      </PageHeader>

      <RequirementSummaryCard requirement={requirement} />

      {proposals.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="No proposals yet"
          description={
            event.status === "DRAFT"
              ? "This event is still a draft, so professionals cannot see it. Publish the event to start receiving proposals for this requirement."
              : "Professionals who offer this service can reply with a quote and their availability. You will see their proposals here."
          }
          action={
            <Button
              variant="outline"
              render={
                <Link href={`/dashboard/events/${eventId}`}>
                  <ArrowLeftIcon /> Back to event
                </Link>
              }
            />
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {proposals.map((proposal) => (
            <li key={proposal.id}>
              <ProposalRow proposal={proposal} requirementId={requirementId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The requirement being bid on, summarised so the list keeps its context. */
function RequirementSummaryCard({
  requirement,
}: {
  requirement: EventServiceRequirement;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{requirement.serviceName}</p>
            <StatusBadge status={requirement.status} />
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <DateText value={requirement.startAt} mode="datetime" /> –{" "}
            <DateText value={requirement.endAt} mode="datetime" />
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-right">
          <p className="text-xs text-muted-foreground">Budget</p>
          <CurrencyText
            value={requirement.budget}
            currency={requirement.currency}
            className="font-semibold"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/** One proposal card: the professional plus their bid on this requirement. */
function ProposalRow({
  proposal,
  requirementId,
}: {
  proposal: Proposal;
  requirementId: string;
}) {
  // The list endpoint pre-filters items to this requirement (exactly one per
  // proposal); the fallback keeps the card rendering if that ever changes.
  const item =
    proposal.items?.find(
      (candidate) => candidate.eventServiceRequirementId === requirementId,
    ) ??
    proposal.items?.[0] ??
    null;
  const professional = proposal.professional ?? null;
  const rating = toNumber(professional?.averageRating);

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              {professional?.name ?? "Professional"}
            </p>
            {rating !== null ? (
              <Badge variant="secondary" className="gap-0.5">
                {rating.toFixed(1)}
                <StarIcon className="fill-current" />
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {professional?.professionalTitle ?? "Event professional"}
            {professional ? ` · ${professional.experienceYears} yrs` : ""}
          </p>
        </div>
        <StatusBadge status={item?.status} />
      </div>

      {proposal.message ? (
        <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
          {proposal.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {item ? (
          <>
            <CurrencyText
              value={item.proposedAmount}
              currency={item.currency}
              className="font-semibold"
            />
            <p className="text-muted-foreground">
              <DateText value={item.proposedStartAt} mode="date" /> –{" "}
              <DateText value={item.proposedEndAt} mode="date" />
            </p>
          </>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Submitted <DateText value={proposal.submittedAt} mode="relative" />
        </p>
      </div>

      <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>
          {professional && professional.totalReviews > 0
            ? `${professional.totalReviews} review${professional.totalReviews === 1 ? "" : "s"}`
            : "No reviews yet"}
        </span>
        <Button
          variant="link"
          size="sm"
          nativeButton={false}
          render={
            <Link href={`/dashboard/proposals/${proposal.id}`}>
              View proposal
            </Link>
          }
        />
      </div>
    </div>
  );
}

/** The embedded requirement rows are not filtered server-side. */
function findRequirement(event: Event, requirementId: string) {
  return (
    event.serviceRequirements?.find(
      (requirement) => requirement.id === requirementId,
    ) ?? null
  );
}

/** Mirrors the header, summary card and proposal rows while data loads. */
function ProposalListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>

      <Card size="sm">
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}
