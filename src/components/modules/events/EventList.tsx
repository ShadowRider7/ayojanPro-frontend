"use client";

import { CalendarPlusIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PaginationBar,
  SearchInput,
  SelectFilter,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyEvents } from "@/hooks";
import {
  EVENT_STATUS_OPTIONS,
  type SelectOption,
  withAllOption,
} from "@/lib/constants";
import { EventCard } from "./EventCard";

const PAGE_SIZE = 9;

const STATUS_FILTER_ITEMS: SelectOption[] = withAllOption(
  EVENT_STATUS_OPTIONS,
  "All statuses",
);

const SKELETON_KEYS = Array.from(
  { length: 6 },
  (_, index) => `event-skeleton-${index}`,
);

function EventCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-4 w-44" />
      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function EventList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, refetch } = useMyEvents();
  const events = data?.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesStatus = status === "all" || event.status === status;
      const matchesTerm =
        term === "" ||
        [
          event.title,
          event.description,
          event.eventType,
          event.city,
          event.country,
          event.address,
        ].some((field) => field?.toLowerCase().includes(term));

      return matchesStatus && matchesTerm;
    });
  }, [events, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleEvents = filtered.slice(
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
        title="Events"
        description="Create and manage the events you need professionals for."
      >
        <Button
          nativeButton={false}
          render={<Link href="/dashboard/events/new" />}
        >
          <PlusIcon /> New event
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title, type or city…"
          className="w-full sm:max-w-md"
        />
        <SelectFilter
          items={STATUS_FILTER_ITEMS}
          value={status}
          onChange={handleStatusChange}
          label="Filter by status"
          placeholder="All statuses"
          triggerClassName="sm:w-48"
        />
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <EventCardSkeleton key={key} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load your events"
          error={error}
          onRetry={refetch}
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarPlusIcon}
          title="No events yet"
          description="Create your event, list the services you need, then publish it so professionals can submit proposals."
          action={
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/events/new" />}
            >
              <PlusIcon /> New event
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No events match your filters"
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
            {visibleEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                href={`/dashboard/events/${event.id}`}
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
