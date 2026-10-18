"use client";

import { useForm } from "@tanstack/react-form";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useAttachDeliverable } from "@/hooks";
import type { Deliverable } from "@/types";
import {
  type DeliverableFormValues,
  deliverableFormSchema,
  splitDeliverableUrls,
} from "@/validation";

type DeliverableFormProps = {
  contractId: string;
  /** Already-submitted deliverable; present to edit (upsert) it. */
  deliverable: Deliverable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Dialog form for `POST /contract/:id/deliverable` — the assigned
 * professional submits their work as links, one per line. The endpoint is an
 * upsert, so an existing deliverable seeds the form; resubmitting also flips
 * the contract back to `DELIVERED` (e.g. after a re-open), which the backend
 * enforces to `CONFIRMED`/`IN_PROGRESS` only.
 */
export function DeliverableForm({
  contractId,
  deliverable,
  open,
  onOpenChange,
}: DeliverableFormProps) {
  const { mutate: attachDeliverable, isPending } = useAttachDeliverable();

  const form = useForm({
    defaultValues: {
      title: deliverable?.title ?? "",
      description: deliverable?.description ?? "",
      externalUrl: (deliverable?.externalUrl ?? []).join("\n"),
    } satisfies DeliverableFormValues,
    validators: {
      onSubmit: deliverableFormSchema,
    },
    onSubmit: ({ value }) => {
      attachDeliverable(
        {
          contractId,
          payload: {
            title: value.title,
            description: value.description,
            externalUrl: value.externalUrl,
          },
        },
        {
          onSuccess: () => {
            toast.add({
              title: deliverable
                ? "Deliverable updated"
                : "Deliverable submitted",
              description:
                "The client has been notified and can now review the work.",
              type: "success",
            });
            onOpenChange(false);
          },
          onError: (err) => {
            toast.add({
              title: "Could not submit the deliverable",
              description:
                err.message || "Something went wrong. Please try again",
              type: "error",
            });
          },
        },
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {deliverable ? "Update deliverable" : "Submit deliverable"}
          </DialogTitle>
          <DialogDescription>
            Link the finished work — a design folder, repository, video or
            gallery. The client is notified as soon as you submit.
          </DialogDescription>
        </DialogHeader>

        <form
          id="deliverable-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Final wedding album"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Description (optional)
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      rows={3}
                      placeholder="What is included, how to access it…"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="externalUrl">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const linkCount = splitDeliverableUrls(
                  field.state.value,
                ).length;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Links</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      rows={4}
                      placeholder={
                        "https://drive.google.com/…\nhttps://photos.app.goo.gl/…"
                      }
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                    <FieldDescription>
                      One link per line, at least one required
                      {linkCount > 0 ? ` — ${linkCount} now` : ""}.
                    </FieldDescription>
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </DialogClose>
          <Button type="submit" form="deliverable-form" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner /> Submitting
              </>
            ) : (
              <>
                <UploadIcon />
                {deliverable ? "Save changes" : "Submit deliverable"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
