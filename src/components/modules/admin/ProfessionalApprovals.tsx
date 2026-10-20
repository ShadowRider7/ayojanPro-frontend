"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  BanIcon,
  CheckIcon,
  ExternalLinkIcon,
  FileTextIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  ConfirmDialog,
  DateText,
  EmptyState,
  ErrorState,
  PageHeader,
  SelectFilter,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useAllProfessionals, useApproveProfessional } from "@/hooks";
import {
  APPLICATION_STATUS_OPTIONS,
  type SelectOption,
  withAllOption,
} from "@/lib/constants";
import type { Professional } from "@/types";
import { formatPhone, toNumber } from "@/utils";
import { approveProfessionalSchema } from "@/validation";

type DialogState = {
  action: "reject";
  professional: Professional;
} | null;

const ALL = "all";
const PENDING = "PENDING";
const PAGE_LIMIT = 100;

const STATUS_FILTER_ITEMS: SelectOption[] = withAllOption(
  APPLICATION_STATUS_OPTIONS,
  "All statuses",
);

export function ProfessionalApprovals() {
  const [statusFilter, setStatusFilter] = useState<string>(PENDING);

  // The backend filters by status, so the list is never silently truncated:
  // the applications waiting for a decision are always fetched in full.
  const { data, isPending, isError, error, refetch } = useAllProfessionals({
    status: statusFilter === ALL ? undefined : statusFilter,
    limit: PAGE_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const professionals = data?.data ?? [];
  const queryClient = useQueryClient();
  const { mutate: approve, isPending: isApproving } = useApproveProfessional();
  const [dialog, setDialog] = useState<DialogState>(null);

  const handleApprove = useCallback(
    (professional: Professional) => {
      const payload = {
        professionalId: professional.id,
        status: "APPROVED" as const,
      };

      if (!approveProfessionalSchema.safeParse(payload).success) {
        return;
      }

      approve(payload, {
        onSuccess: () => {
          toast.add({
            title: `${professional.name} approved`,
            description:
              "They can now log in and use the professional workspace.",
            type: "success",
          });
          queryClient.invalidateQueries({
            queryKey: ["admin", "professionals"],
          });
          setDialog(null);
        },
        onError: (err) => {
          toast.add({
            title: "Could not approve professional",
            description:
              err.message || "Something went wrong. Please try again.",
            type: "error",
          });
        },
      });
    },
    [approve, queryClient],
  );

  const handleReject = useCallback(
    (reason: string) => {
      if (!dialog) {
        return;
      }

      const payload = {
        professionalId: dialog.professional.id,
        status: "REJECTED" as const,
        rejectionReason: reason.trim(),
      };
      const parsed = approveProfessionalSchema.safeParse(payload);

      if (!parsed.success) {
        toast.add({
          title: "Could not reject professional",
          description:
            parsed.error.issues[0]?.message ??
            "Please give the professional a reason.",
          type: "error",
        });
        return;
      }

      approve(parsed.data, {
        onSuccess: () => {
          toast.add({
            title: `${dialog.professional.name} rejected`,
            description:
              "They will see the rejection reason in their dashboard.",
            type: "success",
          });
          queryClient.invalidateQueries({
            queryKey: ["admin", "professionals"],
          });
          setDialog(null);
        },
        onError: (err) => {
          toast.add({
            title: "Could not reject professional",
            description:
              err.message || "Something went wrong. Please try again.",
            type: "error",
          });
        },
      });
    },
    [approve, dialog, queryClient],
  );

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Professionals"
          description="Review professional applications and manage their status."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Professionals"
          description="Review professional applications and manage their status."
        />
        <ErrorState
          title="Could not load professionals"
          error={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  const pending = professionals.filter((p) => p.status === "PENDING");
  const reviewed = professionals.filter((p) => p.status !== "PENDING");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Professionals"
        description="Review professional applications and manage their status."
      />

      <SelectFilter
        items={STATUS_FILTER_ITEMS}
        value={statusFilter}
        onChange={setStatusFilter}
        label="Filter by application status"
        placeholder="All statuses"
      />

      {professionals.length === 0 ? (
        <EmptyState
          title="No professionals yet"
          description="When professionals apply to join the platform, their applications will appear here for review."
        />
      ) : (
        <>
          {pending.length > 0 ? (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-lg font-semibold">
                Pending review ({pending.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onApprove={() => handleApprove(professional)}
                    onReject={() =>
                      setDialog({ action: "reject", professional })
                    }
                    isApproving={isApproving}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {reviewed.length > 0 ? (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-lg font-semibold">
                Reviewed ({reviewed.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {reviewed.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onApprove={() => handleApprove(professional)}
                    onReject={() =>
                      setDialog({ action: "reject", professional })
                    }
                    isApproving={isApproving}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <RejectDialog
        dialog={dialog}
        loading={isApproving}
        onClose={() => setDialog(null)}
        onConfirm={handleReject}
      />
    </div>
  );
}

function ProfessionalCard({
  professional,
  onApprove,
  onReject,
  isApproving,
}: {
  professional: Professional;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
}) {
  const user = professional.user;
  const rating = toNumber(professional.averageRating) ?? 0;
  const skills =
    professional.skills?.map((s) => s.skill?.name).filter(Boolean) ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="truncate">{professional.name}</CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {professional.professionalTitle}
            </p>
          </div>
          <StatusBadge status={professional.status} className="shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <MailIcon className="size-3.5" />
            {user?.email ?? professional.email}
          </span>
          {professional.phone ? (
            <span className="flex items-center gap-2">
              <PhoneIcon className="size-3.5" />
              {formatPhone(professional.phone)}
            </span>
          ) : null}
          {[professional.city, professional.country].filter(Boolean).length >
          0 ? (
            <span className="flex items-center gap-2">
              <MapPinIcon className="size-3.5" />
              {[professional.city, professional.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          ) : null}
        </div>

        {professional.bio ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {professional.bio}
          </p>
        ) : null}

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 ? (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                +{skills.length - 4} more
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{professional.experienceYears} yrs exp</span>
          {rating > 0 ? (
            <span className="flex items-center gap-1">
              <StarIcon className="fill-current text-xs" />
              {rating.toFixed(1)} ({professional.totalReviews})
            </span>
          ) : null}
        </div>

        {professional.resume ? (
          <a
            href={professional.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <FileTextIcon className="size-4" />
            View resume
            <ExternalLinkIcon className="size-3" />
          </a>
        ) : null}

        {professional.additionalFiles &&
        professional.additionalFiles.length > 0 ? (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Additional files ({professional.additionalFiles.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {professional.additionalFiles.map((file, idx) => (
                <a
                  key={file.publicId}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <FileTextIcon className="size-3" />
                  Document {idx + 1}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {professional.rejectionReason ? (
          <p className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
            {professional.rejectionReason}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-2 border-t pt-3">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isApproving || professional.status !== "PENDING"}
          >
            <CheckIcon />
            Approve
          </Button>
          {professional.status === "PENDING" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              disabled={isApproving}
            >
              <BanIcon />
              Reject
            </Button>
          ) : null}
          <span className="ml-auto text-xs text-muted-foreground">
            <DateText value={professional.createdAt} mode="relative" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function RejectDialog({
  dialog,
  loading,
  onClose,
  onConfirm,
}: {
  dialog: DialogState;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  if (!dialog) return null;

  return (
    <ConfirmDialog
      open
      loading={loading}
      onOpenChange={(open) => {
        if (!open) {
          setReason("");
          onClose();
        }
      }}
      title={`Reject ${dialog.professional.name}?`}
      description="This will mark their application as rejected. Provide a reason they can see."
      confirmLabel="Reject application"
      onConfirm={() => onConfirm(reason)}
    >
      <Textarea
        placeholder="Explain why this application is being rejected…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
      />
    </ConfirmDialog>
  );
}
