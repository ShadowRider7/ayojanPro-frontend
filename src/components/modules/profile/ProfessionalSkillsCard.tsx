"use client";

import { useForm } from "@tanstack/react-form";
import { PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog, EmptyState, ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAddSkill, useDeleteSkill, usePublicProfessional } from "@/hooks";
import { type SkillFormValues, skillFormSchema } from "@/validation";

type ProfessionalSkillsCardProps = {
  professionalId: string;
  className?: string;
};

function SkillsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2" aria-hidden="true">
      <Skeleton className="h-8 w-28 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-full" />
      <Skeleton className="h-8 w-32 rounded-full" />
    </div>
  );
}

/**
 * Skills section of `/dashboard/professional/profile`. Own skills have no
 * "me" endpoint (2.2), so the list is read from
 * `GET /professional/public/:professionalId` — its skill entries carry the
 * `Skill` id the remove action needs. Adding creates **and** links a skill by
 * name; the backend rejects duplicates platform-wide with a 409, surfaced
 * here as the error toast.
 */
export function ProfessionalSkillsCard({
  professionalId,
  className,
}: ProfessionalSkillsCardProps) {
  const { data, isPending, isError, error, refetch } =
    usePublicProfessional(professionalId);

  const { mutate: addSkill, isPending: isAdding } = useAddSkill();
  const { mutate: removeSkill, isPending: isRemoving } = useDeleteSkill();

  const [pendingRemoval, setPendingRemoval] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const skills = data?.data?.skills ?? [];

  const form = useForm({
    defaultValues: { name: "" } satisfies SkillFormValues,
    validators: {
      onSubmit: skillFormSchema,
    },
    onSubmit: ({ value }) => {
      // The schema trims for validation only — send the trimmed name.
      addSkill(
        { name: value.name.trim() },
        {
          onSuccess: () => {
            form.reset({ name: "" });

            toast.add({ title: "Skill added", type: "success" });
          },
          onError: (err) => {
            toast.add({
              title: "Could not add skill",
              description:
                err.message || "Something went wrong. Please try again",
              type: "error",
            });
          },
        },
      );
    },
  });

  const handleRemove = () => {
    if (!pendingRemoval) {
      return;
    }

    removeSkill(pendingRemoval.id, {
      onSuccess: () => {
        toast.add({ title: "Skill removed", type: "success" });
        setPendingRemoval(null);
      },
      onError: (err) => {
        toast.add({
          title: "Could not remove skill",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
        setPendingRemoval(null);
      },
    });
  };

  return (
    <Card size="sm" className={className}>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Skills clients can filter you by. Keep them specific — Event
          Photography beats Photography.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <form
          id="add-skill-form"
          className="flex items-start gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid} className="flex-1">
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    Skill name
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="Event Photography"
                    autoComplete="off"
                    maxLength={150}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button
            type="submit"
            form="add-skill-form"
            disabled={isAdding || isRemoving}
          >
            {isAdding ? <Spinner /> : <PlusIcon />} Add
          </Button>
        </form>

        {isPending ? (
          <SkillsSkeleton />
        ) : isError ? (
          <ErrorState
            title="Could not load your skills"
            error={error}
            onRetry={refetch}
            className="py-6"
          />
        ) : skills.length === 0 ? (
          <EmptyState
            title="No skills yet"
            description="Add your first skill above — it appears on your public profile right away."
            className="py-8"
          />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {skills.map(({ skill }) => (
              <li
                key={skill.id}
                className="flex items-center gap-1 rounded-full border bg-muted/40 py-1 pl-3 pr-1 text-sm"
              >
                {skill.name}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${skill.name}`}
                  disabled={isAdding || isRemoving}
                  onClick={() => setPendingRemoval(skill)}
                >
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ConfirmDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRemoval(null);
          }
        }}
        title={`Remove ${pendingRemoval?.name ?? "skill"}?`}
        description="It disappears from your public profile. You can add it again later."
        confirmLabel="Remove"
        loading={isRemoving}
        onConfirm={handleRemove}
      />
    </Card>
  );
}
