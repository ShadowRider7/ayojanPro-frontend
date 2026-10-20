"use client";

import { useCallback, useState } from "react";
import {
  DataTable,
  DateText,
  EmptyState,
  PageHeader,
  SearchInput,
  StatusBadge,
} from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminEvents } from "@/hooks";
import { EVENT_STATUS_OPTIONS } from "@/lib/constants";
import type { AdminEvent } from "@/types";
import { eventTypeLabel } from "@/utils";

const STATUS_FILTER_ITEMS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...EVENT_STATUS_OPTIONS,
];

export function AdminEvents() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isPending, error, refetch } = useAdminEvents();
  const events = data?.data ?? [];

  const filtered = events.filter((event) => {
    const matchesStatus = status === "all" || event.status === status;
    const term = search.trim().toLowerCase();
    const matchesTerm =
      term === "" ||
      event.title.toLowerCase().includes(term) ||
      event.client?.user?.name.toLowerCase().includes(term) ||
      event.city?.toLowerCase().includes(term) ||
      event.country?.toLowerCase().includes(term);
    return matchesStatus && matchesTerm;
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleStatusChange = useCallback((value: string | null) => {
    setStatus(value ?? "all");
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Events"
        description="Every event created by clients — across all statuses."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title, client, or location…"
          className="w-full sm:max-w-md"
        />
        <Select
          items={STATUS_FILTER_ITEMS}
          value={status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger
            className="w-full sm:w-44"
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

      <DataTable<AdminEvent>
        columns={[
          {
            id: "title",
            header: "Event",
            cell: (event) => (
              <div className="flex flex-col">
                <span className="font-medium">{event.title}</span>
                <span className="text-muted-foreground text-xs">
                  {event.client?.user?.name ?? "Unknown client"}
                </span>
              </div>
            ),
          },
          {
            id: "type",
            header: "Type",
            cell: (event) => (
              <span className="text-muted-foreground text-sm">
                {eventTypeLabel(event.eventType)}
              </span>
            ),
          },
          {
            id: "location",
            header: "Location",
            cell: (event) => (
              <span className="text-muted-foreground text-sm">
                {[event.city, event.country].filter(Boolean).join(", ") || "—"}
              </span>
            ),
          },
          {
            id: "schedule",
            header: "Schedule",
            cell: (event) => (
              <div className="flex flex-col text-sm">
                <DateText value={event.startAt} />
                <DateText
                  value={event.endAt}
                  className="text-muted-foreground"
                />
              </div>
            ),
          },
          {
            id: "status",
            header: "Status",
            cell: (event) => <StatusBadge status={event.status} />,
          },
          {
            id: "requirements",
            header: "Requirements",
            cell: (event) => (
              <span className="text-muted-foreground text-sm">
                {event.serviceRequirements?.length ?? 0}
              </span>
            ),
          },
          {
            id: "created",
            header: "Created",
            cell: (event) => (
              <DateText
                value={event.createdAt}
                mode="relative"
                className="text-muted-foreground text-sm"
              />
            ),
          },
        ]}
        data={filtered}
        getRowKey={(event) => event.id}
        isLoading={isPending}
        error={error}
        onRetry={refetch}
        emptyState={
          <EmptyState
            title={
              events.length === 0
                ? "No events yet"
                : "No events match your filters"
            }
            description={
              events.length === 0
                ? "When clients create events they will appear here."
                : "Try a different search term or status."
            }
          />
        }
      />
    </div>
  );
}
