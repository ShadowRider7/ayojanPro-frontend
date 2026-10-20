"use client";

import { CalendarSearchIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PaginationBar,
  SearchInput,
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
import { usePublishedEvents } from "@/hooks";
import {
  SERVICE_REQUIREMENT_STATUS_OPTIONS,
  type SelectOption,
  withAllOption,
} from "@/lib/constants";
import type { IQuery } from "@/types";
import { ALL_EVENT_TYPES } from "@/utils";
import { EventCard } from "./EventCard";
import { EventTypeFilter } from "./EventTypeFilter";

const PAGE_SIZE = 9;

const STATUS_FILTER_ITEMS: SelectOption[] = withAllOption(
  SERVICE_REQUIREMENT_STATUS_OPTIONS,
  "All requirement statuses",
);

const SKELETON_KEYS = Array.from(
  { length: 6 },
  (_, index) => `browse-event-skeleton-${index}`,
);

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
  const [eventType, setEventType] = useState(ALL_EVENT_TYPES);
  const [page, setPage] = useState(1);

  const query = useMemo<IQuery>(() => {
    const next: IQuery = { page, limit: PAGE_SIZE };

    if (searchTerm) {
      next.searchTerm = searchTerm;
    }

    if (status !== "all") {
      next.status = status;
    }

    if (eventType !== ALL_EVENT_TYPES) {
      next.eventType = eventType;
    }

    return next;
  }, [page, searchTerm, status, eventType]);

  const { data, isPending, isError, error, refetch } =
    usePublishedEvents(query);

  const events = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters = Boolean(
    searchTerm || status !== "all" || eventType !== ALL_EVENT_TYPES,
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string | null) => {
    setStatus(value ?? "all");
    setPage(1);
  }, []);

  const handleEventTypeChange = useCallback((value: string) => {
    setEventType(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatus("all");
    setEventType(ALL_EVENT_TYPES);
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
        <EventTypeFilter value={eventType} onChange={handleEventTypeChange} />
        <StatusFilter value={status} onChange={handleStatusChange} />
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
              <EventCard
                key={event.id}
                event={event}
                href={`/dashboard/professional/browse-events/${event.id}`}
                postedBy={event.client?.user?.name}
              />
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

function StatusFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      items={STATUS_FILTER_ITEMS}
      value={value}
      onValueChange={(next) => onChange(next ?? "all")}
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
  );
}
