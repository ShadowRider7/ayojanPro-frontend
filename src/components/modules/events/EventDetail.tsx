"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseIcon,
  CalendarIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ConfirmDialog,
  CurrencyText,
  DateText,
  EmptyState,
  ErrorState,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  useDeleteEvent,
  useDeleteServiceRequirement,
  useEvent,
  usePublishEvent,
} from "@/hooks";
import type { EventServiceRequirement } from "@/types";
import { ServiceRequirementForm } from "./ServiceRequirementForm";

type RequirementDialogState = {
  open: boolean;
  requirement: EventServiceRequirement | null;
};

/**
 * `/dashboard/events/[eventId]` — one event with its service requirements.
 * Requirements are read from the array embedded in `GET /event/:eventId`
 * (which works for drafts too, unlike the standalone required-services
 * endpoint) and soft-deleted rows are dropped before rendering, because the
 * backend does not filter them.
 */
export function EventDetail({ eventId }: { eventId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isPending, isError, error, refetch } = useEvent(eventId);
  const event = data?.data ?? null;

  const [requirementDialog, setRequirementDialog] =
    useState<RequirementDialogState>({
      open: false,
      requirement: null,
    });
  const [isPublishDialogOpen, setPublishDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] =
    useState<EventServiceRequirement | null>(null);

  const { mutate: publish, isPending: isPublishing } = usePublishEvent();
  const { mutate: removeEvent, isPending: isDeletingEvent } = useDeleteEvent();
  const { mutate: removeRequirement, isPending: isDeletingRequirement } =
    useDeleteServiceRequirement();

  if (isPending) {
    return <EventDetailSkeleton />;
  }

  if (isError || !event) {
    return (
      <ErrorState
        title="Could not load this event"
        error={error}
        onRetry={refetch}
      />
    );
  }

  const invalidateEvents = () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  const location = [event.city, event.country].filter(Boolean).join(", ");

  // The API embeds soft-deleted requirements too; only show the live ones.
  const requirements =
    event.serviceRequirements?.filter(
      (requirement) => !requirement.isDeleted,
    ) ?? [];

  const handlePublish = () => {
    publish(eventId, {
      onSuccess: () => {
        toast.add({
          title: "Event published",
          description: "Professionals can now find it and submit proposals.",
          type: "success",
        });
        invalidateEvents();
        setPublishDialogOpen(false);
      },
      onError: (err) => {
        toast.add({
          title: "Could not publish event",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
        setPublishDialogOpen(false);
      },
    });
  };

  const handleDeleteEvent = () => {
    removeEvent(eventId, {
      onSuccess: () => {
        toast.add({ title: "Event deleted", type: "success" });
        invalidateEvents();
        router.push("/dashboard/events");
      },
      onError: (err) => {
        toast.add({
          title: "Could not delete event",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
        setDeleteDialogOpen(false);
      },
    });
  };

  const handleDeleteRequirement = () => {
    if (!requirementToDelete) {
      return;
    }

    removeRequirement(
      { eventId, serviceId: requirementToDelete.id },
      {
        onSuccess: () => {
          toast.add({ title: "Requirement removed", type: "success" });
          invalidateEvents();
          setRequirementToDelete(null);
        },
        onError: (err) => {
          toast.add({
            title: "Could not remove requirement",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
          setRequirementToDelete(null);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={event.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {event.eventType ? <span>{event.eventType}</span> : null}
            {location ? <span>{location}</span> : null}
            <StatusBadge status={event.status} />
          </span>
        }
      >
        {event.status === "DRAFT" ? (
          <Button
            variant="outline"
            disabled={isPublishing}
            onClick={() => setPublishDialogOpen(true)}
          >
            <SendIcon /> {isPublishing ? "Publishing…" : "Publish"}
          </Button>
        ) : null}
        <Button
          variant="outline"
          render={
            <Link href={`/dashboard/events/${event.id}/edit`}>
              <PencilIcon /> Edit
            </Link>
          }
        />
        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
          <Trash2Icon /> Delete
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-lg font-semibold">
                Service requirements
              </h2>
              <p className="text-sm text-muted-foreground">
                {event.status === "DRAFT"
                  ? "What professionals will proposal on once you publish the event."
                  : "What professionals proposal on."}
              </p>
            </div>
            <Button
              onClick={() =>
                setRequirementDialog({ open: true, requirement: null })
              }
            >
              <PlusIcon /> Add requirement
            </Button>
          </div>

          {requirements.length === 0 ? (
            <EmptyState
              icon={BriefcaseIcon}
              title="No requirements yet"
              description="List the services you need — photography, catering, decoration — so professionals know what to proposal on."
              action={
                <Button
                  onClick={() =>
                    setRequirementDialog({ open: true, requirement: null })
                  }
                >
                  <PlusIcon /> Add requirement
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {requirements.map((requirement) => (
                <li
                  key={requirement.id}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-4 ring-1 ring-foreground/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{requirement.serviceName}</p>
                        <StatusBadge status={requirement.status} />
                      </div>
                      {requirement.description ? (
                        <p className="text-sm text-muted-foreground">
                          {requirement.description}
                        </p>
                      ) : null}
                    </div>
                    <CurrencyText
                      value={requirement.budget}
                      currency={requirement.currency}
                      className="font-semibold"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <CalendarIcon className="size-3.5 shrink-0" />
                      <DateText value={requirement.startAt} mode="datetime" /> –{" "}
                      <DateText value={requirement.endAt} mode="datetime" />
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() =>
                          setRequirementDialog({ open: true, requirement })
                        }
                      >
                        <PencilIcon /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-destructive"
                        onClick={() => setRequirementToDelete(requirement)}
                      >
                        <Trash2Icon /> Remove
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Card size="sm" className="h-fit">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            {event.description ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Description
                </p>
                <p>{event.description}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Schedule
              </p>
              <p className="flex items-center gap-2">
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                <DateText value={event.startAt} mode="datetime" /> –{" "}
                <DateText value={event.endAt} mode="datetime" />
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Location
              </p>
              {event.address ? <p>{event.address}</p> : null}
              <p className="text-muted-foreground">{location || "Not set"}</p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Created
              </p>
              <DateText value={event.createdAt} mode="relative" />
            </div>
          </CardContent>
        </Card>
      </div>

      {requirementDialog.open ? (
        <ServiceRequirementForm
          hostEvent={event}
          requirement={requirementDialog.requirement}
          open
          onOpenChange={(open) =>
            setRequirementDialog({ open, requirement: null })
          }
        />
      ) : null}

      <ConfirmDialog
        open={isPublishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        title="Publish this event?"
        description="Professionals will be able to find it and submit proposals on its requirements."
        confirmLabel="Publish event"
        variant="default"
        loading={isPublishing}
        onConfirm={handlePublish}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete this event?"
        description="It will disappear from your dashboard. Published events with active contracts cannot be deleted."
        confirmLabel="Delete event"
        loading={isDeletingEvent}
        onConfirm={handleDeleteEvent}
      />

      <ConfirmDialog
        open={Boolean(requirementToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setRequirementToDelete(null);
          }
        }}
        title="Remove this requirement?"
        description="Professionals will no longer see it in the event's requirements."
        confirmLabel="Remove"
        loading={isDeletingRequirement}
        onConfirm={handleDeleteRequirement}
      />
    </div>
  );
}

/** Mirrors the header, requirement list and details card while the event loads. */
function EventDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Card size="sm">
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
