"use client";

import { useCallback, useState } from "react";
import {
  ConfirmDialog,
  CurrencyText,
  DataTable,
  DateText,
  EmptyState,
  PageHeader,
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
import { toast } from "@/components/ui/toast";
import { useAdminRefunds, useSettleRefund } from "@/hooks";
import { REFUND_STATUS_OPTIONS } from "@/lib/constants";
import type { AdminRefund } from "@/types";

const STATUS_FILTER_ITEMS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...REFUND_STATUS_OPTIONS,
];

type SettleMode = "COMPLETED" | "FAILED";

export function AdminRefunds() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [settleTarget, setSettleTarget] = useState<AdminRefund | null>(null);
  const [settleMode, setSettleMode] = useState<SettleMode>("COMPLETED");

  const { data, isPending, error, refetch } = useAdminRefunds();
  const { mutate: settle, isPending: isSettling } = useSettleRefund();
  const refunds = data?.data ?? [];

  const filtered = refunds.filter((refund) => {
    const matchesStatus = status === "all" || refund.status === status;
    const term = search.trim().toLowerCase();
    const matchesTerm =
      term === "" ||
      refund.contract?.event?.title.toLowerCase().includes(term) ||
      refund.client?.user?.name.toLowerCase().includes(term) ||
      refund.reason.toLowerCase().includes(term);
    return matchesStatus && matchesTerm;
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const openSettleDialog = (refund: AdminRefund, mode: SettleMode) => {
    setSettleTarget(refund);
    setSettleMode(mode);
  };

  const handleSettle = () => {
    if (!settleTarget) {
      return;
    }

    settle(
      {
        refundId: settleTarget.id,
        payload: {
          status: settleMode,
          ...(settleMode === "COMPLETED"
            ? { note: "Settled manually by an admin." }
            : { note: "Marked as failed by an admin." }),
        },
      },
      {
        onSuccess: () => {
          toast.add({
            title:
              settleMode === "COMPLETED"
                ? "Refund marked as returned"
                : "Refund marked as failed",
            description:
              settleMode === "COMPLETED"
                ? "The client has been notified that the money is back."
                : "The client has been notified that the refund still needs attention.",
            type: "success",
          });
          setSettleTarget(null);
        },
        onError: (err) => {
          toast.add({
            title: "Could not settle the refund",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Refunds"
        description="Money that goes back to a client when a contract is cancelled by the professional or by an admin."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by event, client, or reason…"
          className="w-full sm:max-w-md"
        />
        <Select
          items={STATUS_FILTER_ITEMS}
          value={status}
          onValueChange={(value) => setStatus(value ?? "all")}
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

      <DataTable<AdminRefund>
        columns={[
          {
            id: "event",
            header: "Event",
            cell: (refund) => (
              <span className="font-medium text-sm">
                {refund.contract?.event?.title ?? "—"}
              </span>
            ),
          },
          {
            id: "client",
            header: "Client",
            cell: (refund) => (
              <span className="text-sm">
                {refund.client?.user?.name ?? "—"}
              </span>
            ),
          },
          {
            id: "amount",
            header: "Amount",
            cell: (refund) => (
              <CurrencyText
                value={refund.amount}
                currency={refund.currency}
                className="font-medium text-sm"
              />
            ),
          },
          {
            id: "status",
            header: "Status",
            cell: (refund) => <StatusBadge status={refund.status} />,
          },
          {
            id: "reason",
            header: "Reason",
            cell: (refund) => (
              <span className="text-muted-foreground line-clamp-2 text-sm">
                {refund.reason}
              </span>
            ),
          },
          {
            id: "date",
            header: "Created",
            cell: (refund) => (
              <DateText
                value={refund.createdAt}
                mode="relative"
                className="text-muted-foreground text-sm"
              />
            ),
          },
          {
            id: "actions",
            header: "Actions",
            cell: (refund) =>
              refund.status === "COMPLETED" ? (
                <span className="text-muted-foreground text-sm">Settled</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openSettleDialog(refund, "COMPLETED")}
                  >
                    Mark as returned
                  </Button>
                  {refund.status !== "FAILED" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openSettleDialog(refund, "FAILED")}
                    >
                      Mark as failed
                    </Button>
                  ) : null}
                </div>
              ),
          },
        ]}
        data={filtered}
        getRowKey={(refund) => refund.id}
        isLoading={isPending}
        error={error}
        onRetry={refetch}
        emptyState={
          <EmptyState
            title={
              refunds.length === 0
                ? "No refunds yet"
                : "No refunds match your filters"
            }
            description={
              refunds.length === 0
                ? "When a professional cancels a paid contract, the refund appears here."
                : "Try a different search term or status."
            }
          />
        }
      />

      <ConfirmDialog
        open={Boolean(settleTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setSettleTarget(null);
          }
        }}
        title={
          settleMode === "COMPLETED"
            ? "Mark this refund as returned?"
            : "Mark this refund as failed?"
        }
        description={
          settleMode === "COMPLETED"
            ? "The client is notified that the money is back on their bKash account."
            : "The payment goes back to its previous state and the client is notified that the refund still needs attention."
        }
        confirmLabel={
          settleMode === "COMPLETED" ? "Mark as returned" : "Mark as failed"
        }
        variant={settleMode === "COMPLETED" ? "default" : "destructive"}
        loading={isSettling}
        onConfirm={handleSettle}
      >
        {settleTarget ? (
          <p className="text-sm text-muted-foreground">
            <CurrencyText
              value={settleTarget.amount}
              currency={settleTarget.currency}
              className="font-medium text-foreground"
            />{" "}
            for{" "}
            {settleTarget.contract?.event?.title ?? "the cancelled contract"}.
          </p>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
