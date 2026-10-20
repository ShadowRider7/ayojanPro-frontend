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
import { useAdminPayments } from "@/hooks";
import {
  PAYMENT_STAGE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type SelectOption,
  withAllOption,
} from "@/lib/constants";
import type { Payment } from "@/types";
import { humanize } from "@/utils";

const STATUS_FILTER_ITEMS: SelectOption[] = withAllOption(
  PAYMENT_STATUS_OPTIONS,
  "All statuses",
);

const STAGE_FILTER_ITEMS: SelectOption[] = withAllOption(
  PAYMENT_STAGE_OPTIONS,
  "All stages",
);

export function AdminPayments() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [stage, setStage] = useState("all");

  const { data, isPending, error, refetch } = useAdminPayments();
  const payments = data?.data ?? [];

  const filtered = payments.filter((payment) => {
    const matchesStatus = status === "all" || payment.status === status;
    const matchesStage = stage === "all" || payment.stage === stage;
    const term = search.trim().toLowerCase();
    const matchesTerm =
      term === "" ||
      payment.contract?.event?.title.toLowerCase().includes(term) ||
      payment.client?.user?.name.toLowerCase().includes(term) ||
      payment.merchantInvoiceNumber?.toLowerCase().includes(term);
    return matchesStatus && matchesStage && matchesTerm;
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Every payment transaction on the platform — initial and final settlements."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by event, client, or invoice…"
          className="w-full sm:max-w-md"
        />
        <div className="flex gap-2">
          <SelectFilter
            items={STAGE_FILTER_ITEMS}
            value={stage}
            onChange={setStage}
            label="Filter by stage"
            placeholder="All stages"
            triggerClassName="sm:w-36"
          />
          <SelectFilter
            items={STATUS_FILTER_ITEMS}
            value={status}
            onChange={setStatus}
            label="Filter by status"
            placeholder="All statuses"
          />
        </div>
      </div>

      <DataTable<Payment>
        columns={[
          {
            id: "event",
            header: "Event",
            cell: (payment) => (
              <span className="font-medium text-sm">
                {payment.contract?.event?.title ?? "—"}
              </span>
            ),
          },
          {
            id: "client",
            header: "Client",
            cell: (payment) => (
              <span className="text-sm">
                {payment.client?.user?.name ?? "—"}
              </span>
            ),
          },
          {
            id: "stage",
            header: "Stage",
            cell: (payment) => (
              <span className="text-muted-foreground text-sm">
                {humanize(payment.stage)}
              </span>
            ),
          },
          {
            id: "amount",
            header: "Amount",
            cell: (payment) => (
              <CurrencyText
                value={payment.amount}
                currency={payment.currency}
                className="font-medium text-sm"
              />
            ),
          },
          {
            id: "status",
            header: "Status",
            cell: (payment) => <StatusBadge status={payment.status} />,
          },
          {
            id: "refund",
            header: "Refund",
            cell: (payment) =>
              payment.refund ? (
                <div className="flex flex-col">
                  <StatusBadge status={payment.refund.status} />
                  <CurrencyText
                    value={payment.refund.amount}
                    currency={payment.refund.currency}
                    className="text-muted-foreground text-xs"
                  />
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              ),
          },
          {
            id: "method",
            header: "Method",
            cell: (payment) => (
              <span className="text-muted-foreground text-sm">
                {humanize(payment.method)}
              </span>
            ),
          },
          {
            id: "date",
            header: "Date",
            cell: (payment) => (
              <DateText
                value={payment.createdAt}
                mode="relative"
                className="text-muted-foreground text-sm"
              />
            ),
          },
        ]}
        data={filtered}
        getRowKey={(payment) => payment.id}
        isLoading={isPending}
        error={error}
        onRetry={refetch}
        emptyState={
          <EmptyState
            title={
              payments.length === 0
                ? "No payments yet"
                : "No payments match your filters"
            }
            description={
              payments.length === 0
                ? "When clients make payments they will appear here."
                : "Try a different search term, stage, or status."
            }
          />
        }
      />
    </div>
  );
}
