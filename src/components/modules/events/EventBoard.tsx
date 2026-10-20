"use client";

import { CalendarSearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  Container,
  EmptyState,
  ErrorState,
  PaginationBar,
  SearchInput,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { usePublicEvents } from "@/hooks";
import type { IQuery } from "@/types";
import { ALL_EVENT_TYPES, EVENTS_PATH, normalizeEventType } from "@/utils";
import { EventCard } from "./EventCard";
import { EventTypeFilter } from "./EventTypeFilter";

const PAGE_SIZE = 12;

const SKELETON_KEYS = Array.from(
  { length: 6 },
  (_, index) => `board-skeleton-${index}`,
);

/**
 * The public events board.
 *
 * Anyone can see the published events and filter them by type — a
 * professional does not need an approved account to see what work is
 * available. Signing in is what unlocks sending a proposal.
 *
 * The event type and the page live in the URL, so the board always shows
 * what the link asked for: the header menu, the home page categories and a
 * shared link all land on the same filtered list, and the filter on the page
 * keeps the address bar in step.
 */
export default function EventBoard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  const eventType = normalizeEventType(searchParams.get("eventType"));
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const query = useMemo<IQuery>(() => {
    const next: IQuery = { page, limit: PAGE_SIZE };

    if (searchTerm) {
      next.searchTerm = searchTerm;
    }

    if (eventType !== ALL_EVENT_TYPES) {
      next.eventType = eventType;
    }

    return next;
  }, [page, searchTerm, eventType]);

  const { data, isPending, isError, error, refetch } = usePublicEvents(query);

  const events = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters = Boolean(searchTerm || eventType !== ALL_EVENT_TYPES);

  /**
   * Write the filters back to the URL. The event type and the page are the
   * two filters a link can carry, so they are the two the address bar keeps.
   */
  const applyFilters = useCallback(
    (next: { eventType?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.eventType === ALL_EVENT_TYPES) {
        params.delete("eventType");
      } else if (next.eventType !== undefined) {
        params.set("eventType", next.eventType);
      }

      if (next.page === undefined || next.page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(next.page));
      }

      const search = params.toString();

      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      applyFilters({ page: 1 });
    },
    [applyFilters],
  );

  const handleEventTypeChange = useCallback(
    (value: string) => {
      applyFilters({ eventType: value, page: 1 });
    },
    [applyFilters],
  );

  const handlePageChange = useCallback(
    (value: number) => {
      applyFilters({ page: value });
    },
    [applyFilters],
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    applyFilters({ eventType: ALL_EVENT_TYPES, page: 1 });
  }, [applyFilters]);

  return (
    <section className="py-12 sm:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse events
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Every published event that is looking for professionals. Pick an
            event type to narrow the list, then send a proposal for the services
            you offer.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by title, description or city…"
            className="w-full sm:max-w-md"
          />
          <EventTypeFilter value={eventType} onChange={handleEventTypeChange} />
        </div>

        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="h-48 rounded-xl border bg-card ring-1 ring-foreground/10"
              />
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
            title={
              hasFilters ? "No matching events" : "No published events yet"
            }
            description={
              hasFilters
                ? "Try a different event type or clear the filters to see every event."
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  href={`${EVENTS_PATH}/${event.id}`}
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
                onPageChange={handlePageChange}
              />
            ) : null}
          </>
        )}
      </Container>
    </section>
  );
}
