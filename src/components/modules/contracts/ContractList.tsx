"use client";

import { FileSignatureIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
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
import { useContracts, useGetMe } from "@/hooks";
import { CONTRACT_STATUS_OPTIONS } from "@/lib/constants";
import type { Contract } from "@/types";

const PAGE_SIZE = 9;

const STATUS_FILTER_ITEMS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...CONTRACT_STATUS_OPTIONS,
];

const SKELETON_KEYS = Array.from(
  { length: 6 },
  (_, index) => `contract-skeleton-${index}`,
);

function ContractCard({
  contract,
  isProfessional,
}: {
  contract: Contract;
  isProfessional: boolean;
}) {
  const event = contract.event ?? null;
  const requirement = contract.eventServiceRequirement ?? null;
  const professional = contract.professional ?? null;
  const client = contract.client ?? null;
  const clientName = client?.user?.name ?? "—";
  const professionalName = professional?.name ?? "—";
  const otherPartyName = isProfessional ? clientName : professionalName;

  return (
    <Link
      href={`/dashboard/contracts/${contract.id}`}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-heading leading-snug font-medium group-hover:text-primary">
          {event?.title ?? requirement?.serviceName ?? "Contract"}
        </h2>
        <StatusBadge status={contract.status} className="shrink-0" />
      </div>

      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>
          Service:{" "}
          <span className="text-foreground">
            {requirement?.serviceName ?? "—"}
          </span>
        </p>
        <p>
          {isProfessional ? "Client" : "Professional"}:{" "}
          <span className="text-foreground">{otherPartyName}</span>
        </p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Agreed amount</span>
        <CurrencyText
          value={contract.agreedAmount}
          currency={contract.currency}
          className="font-semibold text-foreground"
        />
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
        <span>
          <DateText value={contract.serviceStartAt} /> –{" "}
          <DateText value={contract.serviceEndAt} />
        </span>
        <DateText value={contract.createdAt} mode="relative" />
      </div>
    </Link>
  );
}

function ContractCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-44" />
      <Skeleton className="h-4 w-36" />
      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function ContractList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, refetch } = useContracts();
  const { data: me } = useGetMe();
  const isProfessional = me?.data?.role === "PROFESSIONAL";
  const contracts = data?.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return contracts.filter((contract) => {
      const matchesStatus = status === "all" || contract.status === status;
      const matchesTerm =
        term === "" ||
        [
          contract.event?.title,
          contract.eventServiceRequirement?.serviceName,
          contract.professional?.name,
          contract.currency,
        ].some((field) => field?.toLowerCase().includes(term));

      return matchesStatus && matchesTerm;
    });
  }, [contracts, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleContracts = filtered.slice(
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contracts"
        description={
          isProfessional
            ? "Every contract you've been hired for — track deliverables, status and completion here."
            : "Every contract you signed — track its payments, deliverables and completion here."
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder={
            isProfessional
              ? "Search by event, service or client…"
              : "Search by event, service or professional…"
          }
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
            <ContractCardSkeleton key={key} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load your contracts"
          error={error}
          onRetry={refetch}
        />
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={FileSignatureIcon}
          title="No contracts yet"
          description={
            isProfessional
              ? "When a client accepts your proposal, the contract appears here — submit the deliverable once the work is done."
              : "When you accept a professional's proposal, its contract appears here to track payments, deliverables and completion."
          }
          action={
            <Button
              render={
                <Link
                  href={
                    isProfessional
                      ? "/dashboard/professional/browse-events"
                      : "/dashboard/events"
                  }
                />
              }
            >
              {isProfessional ? "Browse events" : "Go to my events"}
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No contracts match your filters"
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
            {visibleContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                isProfessional={isProfessional}
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
    </div>
  );
}
