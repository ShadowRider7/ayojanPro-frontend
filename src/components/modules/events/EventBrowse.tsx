"use client";

import { CalendarSearchIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  DateText,
  EmptyState,
  ErrorState,
  PageHeader,
  PaginationBar,
  SearchInput,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublishedEvents } from "@/hooks";
import { SERVICE_REQUIREMENT_STATUS_OPTIONS } from "@/lib/constants";
import type { Event, IQuery } from "@/types";

const PAGE_SIZE = 9;

const STATUS_FILTER_ITEMS: { value: string; label: string }[] = [
  { value: "all", label: "All requirement statuses" },
  ...SERVICE_REQUIREMENT_STATUS_OPTIONS,
];

const SKELETON_KEYS = Array.from(
  { length: 6 },
  (_, index) => `browse-event-skeleton-${index}`,
);

function EventCard({ event }: { event: Event }) {
  const liveRequirements =
    event.serviceRequirements?.filter(
      (requirement) => !requirement.isDeleted,
    ) ?? [];
  const openCount = liveRequirements.filter(
    (requirement) =>
      requirement.status === "OPEN" ||
      requirement.status === "PARTIALLY_FILLED",
  ).length;
  const location = [event.city, event.country].filter(Boolean).join(", ");

  return (
    <Link
      href={`/dashboard/professional/browse-events/${event.id}`}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <h2 className="font-heading leading-snug font-medium group-hover:text-primary">
        {event.title}
      </h2>

      {event.eventType ? (
        <Badge variant="secondary" className="w-fit">
          {event.eventType}
        </Badge>
      ) : null}

      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        <p>
          <DateText value={event.startAt} /> – <DateText value={event.endAt} />
        </p>
        {location ? <p>{location}</p> : null}
      </div>

      <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>
          {openCount > 0
            ? `${openCount} of ${liveRequirements.length} services open for proposals`
            : `${liveRequirements.length} service${
                liveRequirements.length === 1 ? "" : "s"
              } requested`}
        </span>
        <DateText value={event.createdAt} mode="relative" />
      </div>
    </Link>
  );
}

function EventCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-4 w-44" />
      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function EventBrowse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const query = useMemo<IQuery>(() => {
    const next: IQuery = { page, limit: PAGE_SIZE };

    if (searchTerm) {
      next.searchTerm = searchTerm;
    }

    if (status !== "all") {
      next.status = status;
    }

    return next;
  }, [page, searchTerm, status]);

  const { data, isPending, isError, error, refetch } =
    usePublishedEvents(query);

  const events = data?.data?.data ?? [];
  const meta = data?.data?.meta;
  const hasFilters = Boolean(searchTerm || status !== "all");

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string | null) => {
    setStatus(value ?? "all");
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatus("all");
    setPage(1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Browse events"
        description="Published events looking for professionals. Open an event to see the services it needs, then send one proposal covering every service you want to handle."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by title, service, city or client…"
          className="w-full sm:max-w-md"
        />
        <Select
          items={STATUS_FILTER_ITEMS}
          value={status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger
            className="w-full sm:w-64"
            aria-label="Filter by requirement status"
          >
            <SelectValue placeholder="All requirement statuses" />
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
            <EventCardSkeleton key={key} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load events"
          error={error}
          onRetry={refetch}
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarSearchIcon}
          title={hasFilters ? "No matching events" : "No published events yet"}
          description={
            hasFilters
              ? "Try a different search term or clear the filters to see every event."
              : "Clients have not published any events yet. New opportunities appear here as soon as they do."
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {meta?.total ?? events.length} event
            {(meta?.total ?? events.length) === 1 ? "" : "s"} found
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {meta ? (
            <PaginationBar
              page={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              pageSize={meta.limit}
              showSummary
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
