"use client";

import {
  BriefcaseIcon,
  CalendarIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import {
  ConfirmDialog,
  DateText,
  EmptyState,
  ErrorState,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useDeleteExperience, usePublicProfessional } from "@/hooks";
import type { Experience } from "@/types";
import { ExperienceForm } from "./ExperienceForm";

type ExperienceSectionProps = {
  professionalId: string;
};

type ExperienceDialogState = {
  open: boolean;
  experience: Experience | null;
};

function ExperienceSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

function ExperienceItem({
  experience,
  onEdit,
  onDelete,
}: {
  experience: Experience;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const period = experience.startDate ? (
    <>
      <DateText value={experience.startDate} />
      {experience.endDate ? (
        <>
          {" – "}
          <DateText value={experience.endDate} />
        </>
      ) : (
        " – Present"
      )}
    </>
  ) : null;

  return (
    <li className="flex flex-col gap-2 rounded-xl border bg-card p-4 ring-1 ring-foreground/10 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading text-sm font-medium">{experience.title}</p>
          {experience.organization ? (
            <span className="text-sm text-muted-foreground">
              · {experience.organization}
            </span>
          ) : null}
        </div>
        {period ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3.5" />
            {period}
          </p>
        ) : null}
        {experience.description ? (
          <p className="text-sm text-muted-foreground">
            {experience.description}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${experience.title}`}
          onClick={onEdit}
        >
          <PencilIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${experience.title}`}
          onClick={onDelete}
        >
          <Trash2Icon />
        </Button>
      </div>
    </li>
  );
}

export function ExperienceSection({ professionalId }: ExperienceSectionProps) {
  const { data, isPending, isError, error, refetch } =
    usePublicProfessional(professionalId);

  const { mutate: removeExperience, isPending: isDeleting } =
    useDeleteExperience();

  const [dialog, setDialog] = useState<ExperienceDialogState>({
    open: false,
    experience: null,
  });
  const [pendingDelete, setPendingDelete] = useState<Experience | null>(null);

  const experiences = data?.data?.experiences ?? [];

  const handleDelete = () => {
    if (!pendingDelete) {
      return;
    }

    removeExperience(pendingDelete.id, {
      onSuccess: () => {
        toast.add({ title: "Experience removed", type: "success" });
        setPendingDelete(null);
      },
      onError: (err) => {
        toast.add({
          title: "Could not remove experience",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
        setPendingDelete(null);
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle>Experience</CardTitle>
            <CardDescription>
              Your work history, shown as a timeline on your public profile.
            </CardDescription>
          </div>
          <Button
            onClick={() => setDialog({ open: true, experience: null })}
            disabled={isPending || isError}
          >
            <PlusIcon /> Add experience
          </Button>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <ExperienceSkeleton />
          ) : isError ? (
            <ErrorState
              title="Could not load your experience"
              error={error}
              onRetry={refetch}
            />
          ) : experiences.length === 0 ? (
            <EmptyState
              icon={BriefcaseIcon}
              title="No experience yet"
              description="Add the roles and gigs that show clients what you have done."
              action={
                <Button
                  onClick={() => setDialog({ open: true, experience: null })}
                >
                  <PlusIcon /> Add experience
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {experiences.map((experience) => (
                <ExperienceItem
                  key={experience.id}
                  experience={experience}
                  onEdit={() => setDialog({ open: true, experience })}
                  onDelete={() => setPendingDelete(experience)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {dialog.open ? (
        <ExperienceForm
          experience={dialog.experience}
          open={dialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setDialog({ open: false, experience: null });
            }
          }}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
        title="Delete this experience?"
        description={`"${pendingDelete?.title ?? ""}" will be removed from your profile permanently.`}
        confirmLabel="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
