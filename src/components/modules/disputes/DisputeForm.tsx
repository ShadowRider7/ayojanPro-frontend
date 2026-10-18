"use client";

import { useForm } from "@tanstack/react-form";
import { FileIcon, UploadIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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

type DisputeFormValues = {
  reason: string;
  description: string;
};

export function DisputeForm({
  contractId,
  onSuccess,
  onOpenChange,
}: {
  contractId: string;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: raiseDispute, isPending } = useRaiseDispute();
  const [evidence, setEvidence] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      reason: "",
      description: "",
    } satisfies DisputeFormValues,
    validators: {
      onSubmit: ({ value }) => {
        if (evidence.length === 0) {
          return "At least one piece of evidence is required";
        }
        if (value.reason.length < 3) {
          return "Reason must be at least 3 characters";
        }
        if (value.description.length < 10) {
          return "Please describe the issue in more detail";
        }
        return undefined;
      },
    },
    onSubmit: ({ value }) => {
      raiseDispute(
        {
          contractId,
          payload: { reason: value.reason, description: value.description },
          evidence,
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
            setEvidence([]);
            onSuccess();
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

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      setEvidence((prev) => [...prev, ...files]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [],
  );

  const removeFile = useCallback((index: number) => {
    setEvidence((prev) => prev.filter((_, i) => i !== index));
  }, []);

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
      </FieldGroup>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Evidence (required)</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="dispute-evidence"
        />
        <label
          htmlFor="dispute-evidence"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <UploadIcon className="size-4" />
          Click to upload evidence files
        </label>
        {evidence.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {evidence.map((file, idx) => (
              <li
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2 truncate">
                  <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Upload at least one file (image, PDF, or document) as evidence.
        </p>
      </div>

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
