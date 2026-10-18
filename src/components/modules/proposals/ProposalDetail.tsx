"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, FileTextIcon, InfoIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  ConfirmDialog,
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
import { toast } from "@/components/ui/toast";
import { useAcceptProposal, useProposal, useRejectProposal } from "@/hooks";
import type { ProposalItem, ProposalStatus } from "@/types";
import { humanize, toNumber } from "@/utils";

type ProposalDetailProps = {
  proposalId: string;
};

/** In priority order: a proposal is what its pending items still need. */
const STATUS_PRIORITY: ProposalStatus[] = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "EXPIRED",
];

/**
 * `/dashboard/proposals/[proposalId]` — one proposal with every item (a
 * proposal can span several requirements of the same event). This is where
 * the client decides: accept/reject act on the **whole** proposal, so the
 * screens explain the cascade — each pending item becomes (or declines into)
 * its own contract, and accepting auto-rejects competing proposals.
 */
export function ProposalDetail({ proposalId }: ProposalDetailProps) {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch } = useProposal(proposalId);
  const proposal = data?.data ?? null;

  const [dialog, setDialog] = useState<"accept" | "reject" | null>(null);
  const { mutate: accept, isPending: isAccepting } = useAcceptProposal();
  const { mutate: reject, isPending: isRejecting } = useRejectProposal();

  if (isPending) {
    return <ProposalDetailSkeleton />;
  }

  if (isError || !proposal) {
    return (
      <ErrorState
        title="Could not load this proposal"
        error={error}
        onRetry={refetch}
      />
    );
  }

  const items = proposal.items ?? [];
  const pendingItems = items.filter((item) => item.status === "PENDING");
  const professional = proposal.professional ?? null;
  const overallStatus = deriveOverallStatus(items);
  const rating = toNumber(professional?.averageRating);

  // Item statuses feed the requirement cards on the event screen (embedded
  // in `GET /event/:eventId`), so accept/reject refresh both key trees.
  const invalidateProposals = () => {
    queryClient.invalidateQueries({ queryKey: ["proposals"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  const handleAccept = () => {
    accept(proposalId, {
      onSuccess: (response) => {
        const created = Array.isArray(response.data)
          ? response.data.length
          : response.data
            ? 1
            : 0;
        toast.add({
          title: "Proposal accepted",
          description:
            created === 1
              ? "1 contract created — manage it under Contracts."
              : `${created} contracts created — manage them under Contracts.`,
          type: "success",
        });
        // The backend accepts items one by one; refetching after success
        // (and error, below) keeps the cascade visible wherever it applied.
        invalidateProposals();
        setDialog(null);
      },
      onError: (err) => {
        toast.add({
          title: "Could not accept proposal",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
        // A mid-loop failure can leave earlier items accepted, so refetch
        // even on error rather than assuming nothing changed.
        invalidateProposals();
        setDialog(null);
      },
    });
  };

  const handleReject = () => {
    reject(proposalId, {
      onSuccess: () => {
        toast.add({
          title: "Proposal rejected",
          description: "The professional has been notified.",
          type: "success",
        });
        invalidateProposals();
        setDialog(null);
      },
      onError: (err) => {
        toast.add({
          title: "Could not reject proposal",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
        invalidateProposals();
        setDialog(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Proposal from ${professional?.name ?? "a professional"}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>for {proposal.event?.title ?? "your event"}</span>
            <span>
              · Submitted{" "}
              <DateText value={proposal.submittedAt} mode="relative" />
            </span>
            {overallStatus ? <StatusBadge status={overallStatus} /> : null}
          </span>
        }
      >
        <Button
          variant="outline"
          render={
            <Link href={`/dashboard/events/${proposal.eventId}`}>
              <ArrowLeftIcon /> Back to event
            </Link>
          }
        />
        {pendingItems.length > 0 ? (
          <>
            <Button
              variant="destructive"
              disabled={isAccepting || isRejecting}
              onClick={() => setDialog("reject")}
            >
              Reject
            </Button>
            <Button
              disabled={isAccepting || isRejecting}
              onClick={() => setDialog("accept")}
            >
              Accept proposal
            </Button>
          </>
        ) : null}
      </PageHeader>

      <Card size="sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
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
          <Button
            variant="link"
            size="sm"
            nativeButton={false}
            render={
              <Link href={`/professionals/${proposal.professionalId}`}>
                View public profile
              </Link>
            }
          />
        </CardContent>
      </Card>

      {proposal.message ? (
        <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/10">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Cover note
          </p>
          <p className="text-sm">{proposal.message}</p>
        </div>
      ) : null}

      {pendingItems.length > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed bg-muted/40 p-4">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-medium">How accepting works</p>
            <p className="text-muted-foreground">
              Accepting responds to the whole proposal: every pending item below
              is accepted at once — each one creates a contract at the proposed
              amount and schedule, marks its requirement FILLED, and
              automatically rejects every other pending proposal competing for
              those requirements.
            </p>
          </div>
        </div>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold">
            Requested services
          </h2>
          <p className="text-sm text-muted-foreground">
            One item per service requirement — the quoted amount and schedule
            become the contract's terms.
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={FileTextIcon}
            title="Nothing to review"
            description="This proposal does not contain any service items."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <ProposalItemCard item={item} eventId={proposal.eventId} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={dialog === "accept"}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
          }
        }}
        title="Accept this proposal?"
        description={`This accepts all ${pendingItems.length} pending item${pendingItems.length === 1 ? "" : "s"} below at once and cannot be undone.`}
        confirmLabel="Accept proposal"
        variant="default"
        loading={isAccepting}
        onConfirm={handleAccept}
      >
        <ul className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
          {pendingItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <span>
                {item.eventServiceRequirement?.serviceName ?? "Service item"}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <CurrencyText
                  value={item.proposedAmount}
                  currency={item.currency}
                />
                <DateText value={item.proposedStartAt} /> –{" "}
                <DateText value={item.proposedEndAt} />
              </span>
            </li>
          ))}
        </ul>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "reject"}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
          }
        }}
        title="Reject this proposal?"
        description={`All ${pendingItems.length} pending item${pendingItems.length === 1 ? "" : "s"} will be marked rejected and the professional will be notified. This cannot be undone.`}
        confirmLabel="Reject proposal"
        loading={isRejecting}
        onConfirm={handleReject}
      />
    </div>
  );
}

/** One proposal item: the requirement, the quoted service, amount and dates. */
function ProposalItemCard({
  item,
  eventId,
}: {
  item: ProposalItem;
  eventId: string;
}) {
  const requirement = item.eventServiceRequirement ?? null;
  const service = item.professionalService ?? null;
  const contract = item.contract ?? null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              {requirement?.serviceName ?? "Service requirement"}
            </p>
            <StatusBadge status={item.status} />
            {contract ? (
              <StatusBadge
                status={contract.status}
                label={`Contract · ${humanize(contract.status)}`}
              />
            ) : null}
          </div>
          {requirement?.description ? (
            <p className="text-sm text-muted-foreground">
              {requirement.description}
            </p>
          ) : null}
        </div>
        <CurrencyText
          value={item.proposedAmount}
          currency={item.currency}
          className="font-semibold"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <p>
          Service:{" "}
          <span className="text-foreground">{service?.name ?? "—"}</span>
        </p>
        <p>
          <DateText value={item.proposedStartAt} /> –{" "}
          <DateText value={item.proposedEndAt} />
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span>
          {item.respondedAt ? (
            <>
              Responded <DateText value={item.respondedAt} mode="relative" />
            </>
          ) : (
            "Waiting for your response"
          )}
        </span>
        <Button
          variant="link"
          size="sm"
          nativeButton={false}
          render={
            <Link
              href={`/dashboard/events/${eventId}/requirements/${item.eventServiceRequirementId}/proposals`}
            >
              All proposals for this requirement
            </Link>
          }
        />
      </div>
    </div>
  );
}

/**
 * A proposal spans many items, each with its own status; surface the one
 * that still needs attention first (pending), then what already happened.
 */
function deriveOverallStatus(items: ProposalItem[]): ProposalStatus | null {
  for (const status of STATUS_PRIORITY) {
    if (items.some((item) => item.status === status)) {
      return status;
    }
  }

  return items[0]?.status ?? null;
}

/** Mirrors the header, professional card and item list while the load runs. */
function ProposalDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      <Card size="sm">
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
