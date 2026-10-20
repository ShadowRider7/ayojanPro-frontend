"use client";

import { useForm } from "@tanstack/react-form";
import { FileUpload } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useRaiseDispute } from "@/hooks";
import { raiseDisputeSchema, validateOnChange } from "@/validation";

type DisputeFormValues = {
  reason: string;
  description: string;
  evidence: File[];
};

export function DisputeForm({
  contractId,
  onSuccess,
  onOpenChange,
}: {
  contractId: string;
  /** Called after the dispute was raised, before the dialog closes. */
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: raiseDispute, isPending } = useRaiseDispute();

  const form = useForm({
    defaultValues: {
      reason: "",
      description: "",
      evidence: [] as File[],
    } satisfies DisputeFormValues,
    validators: validateOnChange(raiseDisputeSchema),
    onSubmit: ({ value }) => {
      raiseDispute(
        {
          contractId,
          payload: { reason: value.reason, description: value.description },
          evidence: value.evidence,
        },
        {
          onSuccess: () => {
            toast.add({
              title: "Dispute raised",
              description:
                "The other party has been notified. An admin will review your dispute.",
              type: "success",
            });
            form.reset();
            onSuccess?.();
            onOpenChange(false);
          },
          onError: (err) => {
            toast.add({
              title: "Could not raise dispute",
              description:
                err.message || "Something went wrong. Please try again.",
              type: "error",
            });
          },
        },
      );
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="reason">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  maxLength={255}
                  placeholder="Brief summary of the issue"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
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
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  rows={4}
                  maxLength={5000}
                  placeholder="Describe the issue in detail (min 10 characters)..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="evidence">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>Evidence (required)</FieldLabel>
                <FileUpload
                  value={field.state.value}
                  onChange={(files) => field.handleChange(files)}
                  accept="image/*,.pdf,.doc,.docx"
                  multiple
                  prompt="Click to upload evidence files"
                  description="Upload at least one file (image, PDF, or document) as evidence."
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 border-t pt-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Raise dispute"}
        </Button>
      </div>
    </form>
  );
}
