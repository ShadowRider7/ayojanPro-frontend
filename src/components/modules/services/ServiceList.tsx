"use client";

import { PencilIcon, PlusIcon, Trash2Icon, WrenchIcon } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useDeleteService, useMyServices } from "@/hooks";
import type { ProfessionalService } from "@/types";
import { formatCurrency, toNumber } from "@/utils/formatters";
import { ServiceForm } from "./ServiceForm";

type ServiceDialogState = {
  open: boolean;
  service: ProfessionalService | null;
};

function ServiceSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
    </div>
  );
}

// Mirrors formatPriceRange in modules/professionals/ProfessionalProfile.
function formatPriceRange(service: ProfessionalService) {
  const min = toNumber(service.minimumPrice);
  const max = toNumber(service.maximumPrice);

  if (min !== null && max !== null) {
    return min === max
      ? formatCurrency(min)
      : `${formatCurrency(min)} – ${formatCurrency(max)}`;
  }

  if (min !== null) {
    return `From ${formatCurrency(min)}`;
  }

  if (max !== null) {
    return `Up to ${formatCurrency(max)}`;
  }

  return "";
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
}: {
  service: ProfessionalService;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const price = formatPriceRange(service);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">{service.name}</CardTitle>
          {service.pricingNote ? (
            <CardDescription>{service.pricingNote}</CardDescription>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${service.name}`}
            onClick={onEdit}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${service.name}`}
            onClick={onDelete}
          >
            <Trash2Icon />
          </Button>
        </div>
      </CardHeader>
      {service.description || price ? (
        <CardContent className="flex flex-col gap-2">
          {service.description ? (
            <p className="text-sm text-muted-foreground">
              {service.description}
            </p>
          ) : null}
          {price ? (
            <p className="text-sm font-medium tabular-nums">{price}</p>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

/**
 * `/dashboard/professional/services` — manage the services clients see on the
 * public profile (`GET /professional/me/services`, create/edit/delete under
 * `/professional/service`). `isActive` is backend-managed and not editable
 * here; mutations also invalidate the public profile keys.
 */
export function ServiceList() {
  const { data, isPending, isError, error, refetch } = useMyServices();

  const { mutate: removeService, isPending: isDeleting } = useDeleteService();

  const [dialog, setDialog] = useState<ServiceDialogState>({
    open: false,
    service: null,
  });
  const [pendingDelete, setPendingDelete] =
    useState<ProfessionalService | null>(null);

  const services = data?.data ?? [];

  const handleDelete = () => {
    if (!pendingDelete) {
      return;
    }

    removeService(pendingDelete.id, {
      onSuccess: () => {
        toast.add({ title: "Service removed", type: "success" });
        setPendingDelete(null);
      },
      onError: (err) => {
        toast.add({
          title: "Could not remove service",
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
            <CardTitle>Services</CardTitle>
            <CardDescription>
              The services you offer, with their price ranges. Clients compare
              these across professionals.
            </CardDescription>
          </div>
          <Button
            onClick={() => setDialog({ open: true, service: null })}
            disabled={isPending || isError}
          >
            <PlusIcon /> Add service
          </Button>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <ServiceSkeleton />
          ) : isError ? (
            <ErrorState
              title="Could not load your services"
              error={error}
              onRetry={refetch}
            />
          ) : services.length === 0 ? (
            <EmptyState
              icon={WrenchIcon}
              title="No services yet"
              description="Add the services you offer so clients know what you can do for them."
              action={
                <Button
                  onClick={() => setDialog({ open: true, service: null })}
                >
                  <PlusIcon /> Add service
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={() => setDialog({ open: true, service })}
                  onDelete={() => setPendingDelete(service)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {dialog.open ? (
        <ServiceForm
          service={dialog.service}
          open={dialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setDialog({ open: false, service: null });
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
        title="Delete this service?"
        description={`"${pendingDelete?.name ?? ""}" will be removed from your profile permanently.`}
        confirmLabel="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
