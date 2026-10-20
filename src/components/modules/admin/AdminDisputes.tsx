"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  ConfirmDialog,
  DataTable,
  DateText,
  EmptyState,
  PageHeader,
  SearchInput,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  useDisputes,
  useResolveDispute,
  useUpdateDisputeStatus,
} from "@/hooks";
import { DISPUTE_STATUS_OPTIONS } from "@/lib/constants";
import type { Dispute, DisputeStatus } from "@/types";

const STATUS_FILTER_ITEMS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...DISPUTE_STATUS_OPTIONS,
];

const STATUS_TRANSITIONS: Exclude<DisputeStatus, "RESOLVED">[] = [
  "OPEN",
  "UNDER_REVIEW",
  "REJECTED",
  "CLOSED",
];

function isTransitionableStatus(
  status: DisputeStatus,
): status is "OPEN" | "UNDER_REVIEW" | "REJECTED" | "CLOSED" {
  return ["OPEN", "UNDER_REVIEW", "REJECTED", "CLOSED"].includes(status);
}

export function AdminDisputes() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { data, isPending, error, refetch } = useDisputes();
  const disputes = data?.data ?? [];

  const queryClient = useQueryClient();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateDisputeStatus();
  const { mutate: resolve, isPending: isResolving } = useResolveDispute();

  const [resolveTarget, setResolveTarget] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [refundClient, setRefundClient] = useState(false);

  const filtered = disputes.filter((dispute) => {
    const matchesStatus = status === "all" || dispute.status === status;
    const term = search.trim().toLowerCase();
    const matchesTerm =
      term === "" ||
      dispute.contract?.event?.title.toLowerCase().includes(term) ||
      dispute.reason.toLowerCase().includes(term) ||
      dispute.raisedBy?.name.toLowerCase().includes(term);
    return matchesStatus && matchesTerm;
  });

  const handleStatusChange = useCallback(
    (disputeId: string, newStatus: string) => {
      updateStatus(
        {
          disputeId,
          payload: {
            status: newStatus as
              | "OPEN"
              | "UNDER_REVIEW"
              | "REJECTED"
              | "CLOSED",
          },
        },
        {
          onSuccess: () => {
            toast.add({ title: "Dispute status updated", type: "success" });
            queryClient.invalidateQueries({ queryKey: ["disputes"] });
          },
          onError: (err) => {
            toast.add({
              title: "Could not update status",
              description:
                err.message || "Something went wrong. Please try again.",
              type: "error",
            });
          },
        },
      );
    },
    [updateStatus, queryClient],
  );

  const handleResolve = useCallback(() => {
    if (!resolveTarget) return;
    if (resolution.trim().length < 10) {
      toast.add({
        title: "Resolution too short",
        description: "Please provide at least 10 characters.",
        type: "error",
      });
      return;
    }
    resolve(
      {
        disputeId: resolveTarget.id,
        payload: {
          resolution: resolution.trim(),
          ...(refundClient ? { refundClient: true } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Dispute resolved",
            description: refundClient
              ? "Both parties have been notified and the client's payment is being returned."
              : "Both parties have been notified.",
            type: "success",
          });
          queryClient.invalidateQueries({ queryKey: ["disputes"] });
          setResolveTarget(null);
          setResolution("");
          setRefundClient(false);
        },
        onError: (err) => {
          toast.add({
            title: "Could not resolve dispute",
            description:
              err.message || "Something went wrong. Please try again.",
            type: "error",
          });
        },
      },
    );
  }, [resolve, resolveTarget, resolution, refundClient, queryClient]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Disputes"
        description="Review and resolve disputes raised by clients and professionals."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by event, reason, or raised by…"
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

      <DataTable<
        Dispute & { status: "OPEN" | "UNDER_REVIEW" | "REJECTED" | "CLOSED" }
      >
        columns={[
          {
            id: "event",
            header: "Event",
            cell: (dispute) => (
              <div className="flex flex-col">
                <span className="font-medium">
                  {dispute.contract?.event?.title ?? "—"}
                </span>
                <span className="text-muted-foreground text-xs">
                  {dispute.contract?.eventServiceRequirement?.serviceName ??
                    "—"}
                </span>
              </div>
            ),
          },
          {
            id: "raisedBy",
            header: "Raised by",
            cell: (dispute) => (
              <div className="flex flex-col">
                <span className="text-sm">{dispute.raisedBy?.name ?? "—"}</span>
                <span className="text-muted-foreground text-xs">
                  {dispute.raisedByRole === "CLIENT"
                    ? "Client"
                    : "Professional"}
                </span>
              </div>
            ),
          },
          {
            id: "reason",
            header: "Reason",
            cell: (dispute) => (
              <span className="line-clamp-2 text-sm">{dispute.reason}</span>
            ),
          },
          {
            id: "status",
            header: "Status",
            cell: (dispute) => <StatusBadge status={dispute.status} />,
          },
          {
            id: "date",
            header: "Raised",
            cell: (dispute) => (
              <DateText
                value={dispute.createdAt}
                mode="relative"
                className="text-muted-foreground text-sm"
              />
            ),
          },
          {
            id: "actions",
            header: "",
            headerClassName: "w-48",
            cell: (dispute) => {
              if (!isTransitionableStatus(dispute.status)) {
                return (
                  <span className="text-muted-foreground text-xs">
                    {dispute.status === "RESOLVED" ? "Resolved" : "Closed"}
                  </span>
                );
              }
              return (
                <div className="flex justify-end gap-2">
                  <Select
                    items={STATUS_TRANSITIONS.map((s) => ({
                      value: s,
                      label: s,
                    }))}
                    value={dispute.status}
                    onValueChange={(value) => {
                      if (value && value !== dispute.status) {
                        handleStatusChange(dispute.id, value);
                      }
                    }}
                  >
                    <SelectTrigger
                      className="w-36"
                      disabled={isUpdatingStatus}
                      aria-label={`Change status for dispute ${dispute.id}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_TRANSITIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isResolving}
                    onClick={() => {
                      setResolveTarget(dispute);
                      setResolution("");
                    }}
                  >
                    Resolve
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={filtered.filter(
          (
            d,
          ): d is Dispute & {
            status: "OPEN" | "UNDER_REVIEW" | "REJECTED" | "CLOSED";
          } => isTransitionableStatus(d.status),
        )}
        getRowKey={(dispute) => dispute.id}
        isLoading={isPending}
        error={error}
        onRetry={refetch}
        emptyState={
          <EmptyState
            title={
              disputes.length === 0
                ? "No disputes yet"
                : "No disputes match your filters"
            }
            description={
              disputes.length === 0
                ? "When disputes are raised they will appear here."
                : "Try a different search term or status."
            }
          />
        }
      />

      <ConfirmDialog
        open={resolveTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setResolveTarget(null);
            setResolution("");
            setRefundClient(false);
          }
        }}
        title="Resolve this dispute?"
        description="Provide a resolution summary. This closes the dispute and notifies both parties."
        confirmLabel="Resolve dispute"
        loading={isResolving}
        onConfirm={handleResolve}
      >
        <Textarea
          placeholder="Describe the resolution (min 10 characters)…"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={4}
        />
        <label
          htmlFor="admin-refund-client"
          className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm hover:bg-muted/40 has-[:checked]:border-primary/50 has-[:checked]:bg-muted/40"
        >
          <Checkbox
            id="admin-refund-client"
            className="mt-0.5"
            checked={refundClient}
            onCheckedChange={(checked) => setRefundClient(checked === true)}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium">Refund the client</span>
            <span className="text-xs text-muted-foreground">
              The platform holds the client&apos;s money in escrow. Tick this to
              return it to them as part of the resolution.
            </span>
          </span>
        </label>
      </ConfirmDialog>
    </div>
  );
}
