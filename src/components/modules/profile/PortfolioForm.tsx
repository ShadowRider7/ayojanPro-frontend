"use client";

import { useForm } from "@tanstack/react-form";
import { FileUpload } from "@/components/shared";
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
import { useCreatePortfolioItem, useUpdatePortfolioItem } from "@/hooks";
import { MAX_UPLOAD_SIZE_MB } from "@/lib/constants";
import type { CreatePortfolioItemPayload, PortfolioItem } from "@/types";
import { toDateInput } from "@/utils/formatters";
import {
  createPortfolioItemSchema,
  type PortfolioFormValues,
  portfolioFormSchema,
} from "@/validation";

type PortfolioFormProps = {
  item: PortfolioItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PortfolioForm({
  item,
  open,
  onOpenChange,
}: PortfolioFormProps) {
  const { mutate: createItem, isPending: isCreating } =
    useCreatePortfolioItem();
  const { mutate: updateItem, isPending: isUpdating } =
    useUpdatePortfolioItem();
  const isPending = isCreating || isUpdating;

  const isEditMode = item !== null;

  const form = useForm({
    defaultValues: {
      title: item?.title ?? "",
      description: item?.description ?? "",
      eventType: item?.eventType ?? "",
      workDate: toDateInput(item?.workDate),
      externalUrl: item?.externalUrl ?? "",
      mediaFile: [] as File[],
    } satisfies PortfolioFormValues,
    validators: {
      onSubmit: isEditMode ? portfolioFormSchema : createPortfolioItemSchema,
    },
    onSubmit: ({ value }) => {
      const payload: CreatePortfolioItemPayload = {
        title: value.title.trim(),
        description: value.description.trim(),
        eventType: value.eventType.trim(),
        workDate: new Date(value.workDate).toISOString(),
        externalUrl: value.externalUrl.trim(),
      };

      const handleError = (title: string) => (err: Error) => {
        toast.add({
          title,
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
      };

      if (item) {
        updateItem(
          { portfolioId: item.id, payload },
          {
            onSuccess: () => {
              toast.add({ title: "Portfolio item updated", type: "success" });
              onOpenChange(false);
            },
            onError: handleError("Could not update portfolio item"),
          },
        );
        return;
      }

      const mediaFile = value.mediaFile[0];

      if (!mediaFile) {
        return;
      }

      createItem(
        { payload, mediaFile },
        {
          onSuccess: () => {
            toast.add({ title: "Portfolio item added", type: "success" });
            onOpenChange(false);
          },
          onError: handleError("Could not add portfolio item"),
        },
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit portfolio item" : "Add portfolio item"}
          </DialogTitle>
          <DialogDescription>
            {item
              ? "Update the details of this showcase item. The photo itself cannot be replaced here — delete the item and add it again instead."
              : "Showcase a past event — a photo plus what it was and when."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="portfolio-form"
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
                      placeholder="Garden wedding reception"
                      maxLength={255}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="workDate">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Work date</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="date"
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

              <form.Field name="eventType">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Event type</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="Wedding"
                        maxLength={100}
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
            </div>

            <form.Field name="externalUrl">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      External link{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="url"
                      placeholder="https://…"
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
                      Link to the full album or write-up.
                    </FieldDescription>
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
                      rows={3}
                      maxLength={1000}
                      placeholder="What you delivered for this event."
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

            {!isEditMode ? (
              <form.Field name="mediaFile">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FileUpload
                        accept="image/*"
                        maxSizeMB={MAX_UPLOAD_SIZE_MB}
                        value={field.state.value ?? []}
                        onChange={field.handleChange}
                        description={`JPG, PNG or WebP up to ${MAX_UPLOAD_SIZE_MB} MB.`}
                        disabled={isPending}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>
            ) : null}
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </DialogClose>
          <Button type="submit" form="portfolio-form" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner /> Saving
              </>
            ) : item ? (
              "Save changes"
            ) : (
              "Add item"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
