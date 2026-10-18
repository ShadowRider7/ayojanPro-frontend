"use client";

import { InboxIcon, Undo2Icon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ConfirmDialog,
  CurrencyText,
  DateText,
  EmptyState,
  ErrorState,
  PageHeader,
  PaginationBar,
  SearchInput,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useMyProposals, useWithdrawProposal } from "@/hooks";
import { PROPOSAL_STATUS_OPTIONS } from "@/lib/constants";
import type { Proposal, ProposalItem, ProposalStatus } from "@/types";

const PAGE_SIZE = 6;

const STATUS_FILTER_ITEMS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...PROPOSAL_STATUS_OPTIONS,
];

const STATUS_PRIORITY: ProposalStatus[] = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "EXPIRED",
];

const SKELETON_KEYS = Array.from(
  { length: 6 },
  (_, index) => `my-proposal-skeleton-${index}`,
);

function deriveOverallStatus(items: ProposalItem[]): ProposalStatus | null {
  for (const status of STATUS_PRIORITY) {
    if (items.some((item) => item.status === status)) {
      return status;
    }
  }

  return items[0]?.status ?? null;
}

function ProposalCard({
  proposal,
  onWithdraw,
}: {
  proposal: Proposal;
  onWithdraw: (proposal: Proposal) => void;
}) {
  const items = proposal.items ?? [];
  const event = proposal.event ?? null;
  const pendingItems = items.filter((item) => item.status === "PENDING");
  const overallStatus = deriveOverallStatus(items);

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            href={`/dashboard/professional/browse-events/${proposal.eventId}`}
            className="font-heading leading-snug font-medium outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {event?.title ?? "Event"}
          </Link>
          <p className="text-xs text-muted-foreground">
            Submitted <DateText value={proposal.submittedAt} mode="relative" />
          </p>
        </div>
        {overallStatus ? (
          <StatusBadge status={overallStatus} className="shrink-0" />
        ) : null}
      </div>

      {proposal.message ? (
        <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
          {proposal.message}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2 border-t pt-3 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"
          >
            <span className="flex items-center gap-2">
              <span className="font-medium">
                {item.eventServiceRequirement?.serviceName ?? "Service"}
              </span>
              <StatusBadge status={item.status} />
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <CurrencyText
                value={item.proposedAmount}
                currency={item.currency}
                className="text-sm font-medium text-foreground"
              />
              <span>
                <DateText value={item.proposedStartAt} /> –{" "}
                <DateText value={item.proposedEndAt} />
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>
          {pendingItems.length === 0
            ? "The client has responded to every service."
            : `${pendingItems.length} of ${items.length} service${
                items.length === 1 ? "" : "s"
              } awaiting response`}
        </span>
        {pendingItems.length > 0 ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onWithdraw(proposal)}
          >
            <Undo2Icon /> Withdraw
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ProposalCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-44" />
      <Skeleton className="h-10 w-full" />
      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-24" />
      </div>
    </div>
  );
}

export function MyProposals() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [withdrawTarget, setWithdrawTarget] = useState<Proposal | null>(null);

  const { data, isPending, isError, error, refetch } = useMyProposals();
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawProposal();

  const proposals = data?.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return proposals.filter((proposal) => {
      const matchesStatus =
        status === "all" ||
        deriveOverallStatus(proposal.items ?? []) === status;
      const matchesTerm =
        term === "" ||
        [
          proposal.event?.title,
          proposal.message,
          ...(proposal.items ?? []).map(
            (item) => item.eventServiceRequirement?.serviceName,
          ),
        ].some((field) => field?.toLowerCase().includes(term));

      return matchesStatus && matchesTerm;
    });
  }, [proposals, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleProposals = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string | null) => {
    setStatus(value ?? "all");
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setPage(1);
  }, []);

  const handleWithdraw = () => {
    if (!withdrawTarget) {
      return;
    }

    withdraw(withdrawTarget.id, {
      onSuccess: () => {
        toast.add({
          title: "Proposal withdrawn",
          description:
            "The pending services are no longer offered — the client has been notified.",
          type: "success",
        });
        setWithdrawTarget(null);
      },
      onError: (err) => {
        toast.add({
          title: "Could not withdraw the proposal",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
        refetch();
        setWithdrawTarget(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My proposals"
        description="Every proposal you sent to clients — track responses, or withdraw the ones still waiting."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by event or service…"
          className="w-full sm:max-w-md"
        />
        <Select
          items={STATUS_FILTER_ITEMS}
          value={status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger
            className="w-full sm:w-48"
            aria-label="Filter by status"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <ProposalCardSkeleton key={key} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load your proposals"
          error={error}
          onRetry={refetch}
        />
      ) : proposals.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="No proposals yet"
          description="Find an event that needs your services and send your first proposal — it can cover several requested services at once."
          action={
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/professional/browse-events" />}
            >
              Browse events
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No proposals match your filters"
          description="Try a different search term or status."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onWithdraw={setWithdrawTarget}
              />
            ))}
          </div>
          <PaginationBar
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            showSummary
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}

      <ConfirmDialog
        open={withdrawTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setWithdrawTarget(null);
          }
        }}
        title="Withdraw this proposal?"
        description="Every service still waiting for a response is marked withdrawn and the client is notified. Services the client already responded to are kept. This cannot be undone."
        confirmLabel="Withdraw proposal"
        variant="destructive"
        loading={isWithdrawing}
        onConfirm={handleWithdraw}
      >
        {withdrawTarget ? (
          <ul className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
            {(withdrawTarget.items ?? [])
              .filter((item) => item.status === "PENDING")
              .map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span>
                    {item.eventServiceRequirement?.serviceName ?? "Service"}
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
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
