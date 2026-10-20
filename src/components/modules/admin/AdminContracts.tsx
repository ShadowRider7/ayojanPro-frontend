"use client";

import { useCallback, useState } from "react";
import {
  CurrencyText,
  DataTable,
  DateText,
  EmptyState,
  PageHeader,
  SearchInput,
  SelectFilter,
  StatusBadge,
} from "@/components/shared";
import { useAdminContracts } from "@/hooks";
import {
  CONTRACT_STATUS_OPTIONS,
  type SelectOption,
  withAllOption,
} from "@/lib/constants";
import type { Contract } from "@/types";

const STATUS_FILTER_ITEMS: SelectOption[] = withAllOption(
  CONTRACT_STATUS_OPTIONS,
  "All statuses",
);

export function AdminContracts() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isPending, error, refetch } = useAdminContracts();
  const contracts = data?.data ?? [];

  const filtered = contracts.filter((contract) => {
    const matchesStatus = status === "all" || contract.status === status;
    const term = search.trim().toLowerCase();
    const matchesTerm =
      term === "" ||
      contract.event?.title.toLowerCase().includes(term) ||
      contract.professional?.name.toLowerCase().includes(term) ||
      contract.eventServiceRequirement?.serviceName
        .toLowerCase()
        .includes(term);
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
        title="Contracts"
        description="Every contract created on the platform — track their lifecycle here."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by event, professional, or service…"
          className="w-full sm:max-w-md"
        />
        <SelectFilter
          items={STATUS_FILTER_ITEMS}
          value={status}
          onChange={handleStatusChange}
          label="Filter by status"
          placeholder="All statuses"
        />
      </div>

      <DataTable<Contract>
        columns={[
          {
            id: "event",
            header: "Event",
            cell: (contract) => (
              <div className="flex flex-col">
                <span className="font-medium">
                  {contract.event?.title ?? "—"}
                </span>
                <span className="text-muted-foreground text-xs">
                  {contract.eventServiceRequirement?.serviceName ?? "—"}
                </span>
              </div>
            ),
          },
          {
            id: "client",
            header: "Client",
            cell: (contract) => (
              <span className="text-sm">
                {contract.client?.user?.name ?? "—"}
              </span>
            ),
          },
          {
            id: "professional",
            header: "Professional",
            cell: (contract) => (
              <span className="text-sm">
                {contract.professional?.name ?? "—"}
              </span>
            ),
          },
          {
            id: "amount",
            header: "Amount",
            cell: (contract) => (
              <CurrencyText
                value={contract.agreedAmount}
                currency={contract.currency}
                className="font-medium text-sm"
              />
            ),
          },
          {
            id: "schedule",
            header: "Schedule",
            cell: (contract) => (
              <div className="flex flex-col text-sm">
                <DateText value={contract.serviceStartAt} />
                <DateText
                  value={contract.serviceEndAt}
                  className="text-muted-foreground"
                />
              </div>
            ),
          },
          {
            id: "status",
            header: "Status",
            cell: (contract) => <StatusBadge status={contract.status} />,
          },
          {
            id: "created",
            header: "Created",
            cell: (contract) => (
              <DateText
                value={contract.createdAt}
                mode="relative"
                className="text-muted-foreground text-sm"
              />
            ),
          },
        ]}
        data={filtered}
        getRowKey={(contract) => contract.id}
        isLoading={isPending}
        error={error}
        onRetry={refetch}
        emptyState={
          <EmptyState
            title={
              contracts.length === 0
                ? "No contracts yet"
                : "No contracts match your filters"
            }
            description={
              contracts.length === 0
                ? "When clients accept proposals, contracts appear here."
                : "Try a different search term or status."
            }
          />
        }
      />
    </div>
  );
}
