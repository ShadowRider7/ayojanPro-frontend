"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  FileTextIcon,
  ShieldAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  ConfirmDialog,
  CurrencyText,
  DateText,
  ErrorState,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useDispute, useResolveDispute } from "@/hooks";
import type { Dispute } from "@/types";

/**
 * `/dashboard/disputes/[disputeId]` — party view of a dispute. Shows the
 * reason, description, evidence, status, and resolution. Admins additionally
 * see status-change and resolve actions.
 */
export function DisputeDetail({ disputeId }: { disputeId: string }) {
  const { data, isPending, isError, error, refetch } = useDispute(disputeId);
  const dispute = data?.data ?? null;

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !dispute) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Dispute" description="Loading dispute details…" />
        <ErrorState
          title="Could not load this dispute"
          error={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  return <DisputeView dispute={dispute} />;
}

function DisputeView({ dispute }: { dispute: Dispute }) {
  const queryClient = useQueryClient();
  const contract = dispute.contract ?? null;
  const raisedBy = dispute.raisedBy ?? null;
  const resolvedBy = dispute.resolvedBy ?? null;
  const isTerminal = ["RESOLVED", "REJECTED", "CLOSED"].includes(
    dispute.status,
  );

  const { mutate: resolve, isPending: isResolving } = useResolveDispute();

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolution, setResolution] = useState("");

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["disputes"] });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dispute"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{contract?.event?.title ?? "Contract"}</span>
            <StatusBadge status={dispute.status} />
          </span>
        }
      >
        <Button
          variant="outline"
          render={
            <Link href="/dashboard/contracts">
              <ArrowLeftIcon /> Back to contracts
            </Link>
          }
        />
      </PageHeader>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlertIcon className="size-5 text-destructive" />
            Dispute details
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow label="Raised by">
              <span className="font-medium">
                {raisedBy?.name ?? "Unknown"} (
                {dispute.raisedByRole === "CLIENT" ? "Client" : "Professional"})
              </span>
            </DetailRow>
            <DetailRow label="Raised on">
              <DateText value={dispute.createdAt} mode="datetime" />
            </DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={dispute.status} />
            </DetailRow>
            {dispute.resolvedAt ? (
              <DetailRow label="Resolved on">
                <DateText value={dispute.resolvedAt} mode="datetime" />
              </DetailRow>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Reason
            </span>
            <p className="text-sm">{dispute.reason}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Description
            </span>
            <p className="text-sm">{dispute.description}</p>
          </div>

          {dispute.evidences.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Evidence ({dispute.evidences.length})
              </span>
              <ul className="flex flex-col gap-2">
                {dispute.evidences.map((ev, idx) => (
                  <li key={ev.mediaUrl}>
                    <a
                      href={ev.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                    >
                      <FileTextIcon className="size-4 shrink-0" />
                      <span>Evidence {idx + 1}</span>
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {contract ? (
            <div className="mt-2 border-t pt-3">
              <h3 className="font-heading mb-2 text-sm font-medium">
                Contract
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="Agreed amount">
                  <CurrencyText
                    value={contract.agreedAmount}
                    currency={contract.currency}
                    className="font-medium"
                  />
                </DetailRow>
                <DetailRow label="Service">
                  {contract.eventServiceRequirement?.serviceName ?? "—"}
                </DetailRow>
              </div>
              <Button
                variant="link"
                size="sm"
                className="mt-2 h-auto p-0"
                nativeButton={false}
                render={
                  <Link href={`/dashboard/contracts/${contract.id}`}>
                    View contract
                  </Link>
                }
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {isTerminal && dispute.resolution ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Resolution
              {resolvedBy ? (
                <span className="text-sm font-normal text-muted-foreground">
                  by {resolvedBy.name}
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{dispute.resolution}</p>
          </CardContent>
        </Card>
      ) : null}

      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        title="Update dispute status"
        description="Choose a new status for this dispute."
        confirmLabel="Update status"
        onConfirm={() => {
          // Status update logic handled by admin screen
          setStatusDialogOpen(false);
        }}
      >
        <p className="text-sm text-muted-foreground">
          Status management is available in the admin console.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={resolveDialogOpen}
        onOpenChange={setResolveDialogOpen}
        title="Resolve this dispute?"
        description="Provide a resolution summary. This closes the dispute and notifies both parties."
        confirmLabel="Resolve dispute"
        loading={isResolving}
        onConfirm={() => {
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
              disputeId: dispute.id,
              payload: { resolution: resolution.trim() },
            },
            {
              onSuccess: () => {
                toast.add({
                  title: "Dispute resolved",
                  description: "Both parties have been notified.",
                  type: "success",
                });
                refresh();
                setResolveDialogOpen(false);
                setResolution("");
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
        }}
      >
        <Textarea
          placeholder="Describe the resolution (min 10 characters)…"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={4}
        />
      </ConfirmDialog>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm">{children}</p>
    </div>
  );
}
