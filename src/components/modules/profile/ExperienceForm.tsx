"use client";

import { useForm } from "@tanstack/react-form";
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
import { useAddExperience, useUpdateExperience } from "@/hooks";
import type { CreateExperiencePayload, Experience } from "@/types";
import { toDateInput } from "@/utils/formatters";
import {
  type ExperienceFormValues,
  experienceFormSchema,
  validateOnChange,
} from "@/validation";

type ExperienceFormProps = {
  experience: Experience | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExperienceForm({
  experience,
  open,
  onOpenChange,
}: ExperienceFormProps) {
  const { mutate: addEntry, isPending: isAdding } = useAddExperience();
  const { mutate: updateEntry, isPending: isUpdating } = useUpdateExperience();
  const isPending = isAdding || isUpdating;

  const form = useForm({
    defaultValues: {
      title: experience?.title ?? "",
      organization: experience?.organization ?? "",
      description: experience?.description ?? "",
      startDate: toDateInput(experience?.startDate),
      endDate: toDateInput(experience?.endDate),
    } satisfies ExperienceFormValues,
    validators: validateOnChange(experienceFormSchema),
    onSubmit: ({ value }) => {
      const payload: CreateExperiencePayload = {
        title: value.title.trim(),
        organization: value.organization.trim(),
        description: value.description.trim(),
        startDate:
          value.startDate === ""
            ? undefined
            : new Date(value.startDate).toISOString(),
        endDate:
          value.endDate === ""
            ? undefined
            : new Date(value.endDate).toISOString(),
      };

      const handleSuccess = (title: string) => {
        toast.add({ title, type: "success" });
        onOpenChange(false);
      };

      const handleError = (title: string) => (err: Error) => {
        toast.add({
          title,
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
      };

      if (experience) {
        updateEntry(
          { experienceId: experience.id, payload },
          {
            onSuccess: () => handleSuccess("Experience updated"),
            onError: handleError("Could not update experience"),
          },
        );
        return;
      }

      addEntry(payload, {
        onSuccess: () => handleSuccess("Experience added"),
        onError: handleError("Could not add experience"),
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {experience ? "Edit experience" : "Add experience"}
          </DialogTitle>
          <DialogDescription>
            Your work history — role, organisation and when you did it.
          </DialogDescription>
        </DialogHeader>

        <form
          id="experience-form"
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
                      placeholder="Senior Photographer"
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

            <form.Field name="organization">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Organisation</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Freelance / Studio Name"
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
              <form.Subscribe selector={(state) => state.values.endDate}>
                {(endDate) => (
                  <form.Field name="startDate">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Start date
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="date"
                            max={endDate || undefined}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) => {
                              const nextStartDate = event.target.value;

                              field.handleChange(nextStartDate);

                              // Keep the range valid when the start moves past
                              // the end that was already picked.
                              if (
                                nextStartDate &&
                                endDate &&
                                nextStartDate > endDate
                              ) {
                                form.setFieldValue("endDate", "");
                              }
                            }}
                            aria-invalid={isInvalid}
                          />
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                )}
              </form.Subscribe>

              <form.Subscribe selector={(state) => state.values.startDate}>
                {(startDate) => (
                  <form.Field name="endDate">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>End date</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="date"
                            min={startDate || undefined}
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
                            Leave blank if it is ongoing.
                          </FieldDescription>
                        </Field>
                      );
                    }}
                  </form.Field>
                )}
              </form.Subscribe>
            </div>

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
                      placeholder="What you did in this role."
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
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </DialogClose>
          <Button type="submit" form="experience-form" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner /> Saving
              </>
            ) : experience ? (
              "Save changes"
            ) : (
              "Add experience"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
