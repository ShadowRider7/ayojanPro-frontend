"use client";

import {
  ExternalLinkIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  ConfirmDialog,
  DateText,
  EmptyState,
  ErrorState,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
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
import { useDeletePortfolioItem, useMyPortfolio } from "@/hooks";
import type { PortfolioItem } from "@/types";
import { PortfolioForm } from "./PortfolioForm";

type PortfolioDialogState = {
  open: boolean;
  item: PortfolioItem | null;
};

function PortfolioSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      <Skeleton className="aspect-4/3 rounded-xl" />
      <Skeleton className="aspect-4/3 rounded-xl" />
      <Skeleton className="aspect-4/3 rounded-xl" />
    </div>
  );
}

function PortfolioCard({
  item,
  onEdit,
  onDelete,
}: {
  item: PortfolioItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden pt-0">
      <div className="relative aspect-4/3 w-full bg-muted">
        {item.mediaUrl ? (
          <Image
            src={item.mediaUrl}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-6" />
          </span>
        )}
      </div>
      <CardHeader className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{item.title}</CardTitle>
          {item.eventType ? (
            <Badge variant="outline" className="shrink-0">
              {item.eventType}
            </Badge>
          ) : null}
        </div>
        {item.workDate ? (
          <p className="text-xs text-muted-foreground">
            <DateText value={item.workDate} />
          </p>
        ) : null}
      </CardHeader>
      {item.description || item.externalUrl ? (
        <CardContent className="flex flex-col gap-2">
          {item.description ? (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {item.description}
            </p>
          ) : null}
          {item.externalUrl ? (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View work
              <ExternalLinkIcon className="size-3.5" />
            </a>
          ) : null}
        </CardContent>
      ) : null}
      <div className="flex items-center justify-end gap-1 px-6 pb-4">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${item.title}`}
          onClick={onEdit}
        >
          <PencilIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${item.title}`}
          onClick={onDelete}
        >
          <Trash2Icon />
        </Button>
      </div>
    </Card>
  );
}

export function PortfolioSection() {
  const { data, isPending, isError, error, refetch } = useMyPortfolio();

  const { mutate: removeItem, isPending: isDeleting } =
    useDeletePortfolioItem();

  const [dialog, setDialog] = useState<PortfolioDialogState>({
    open: false,
    item: null,
  });
  const [pendingDelete, setPendingDelete] = useState<PortfolioItem | null>(
    null,
  );

  const items = data?.data ?? [];

  const handleDelete = () => {
    if (!pendingDelete) {
      return;
    }

    removeItem(pendingDelete.id, {
      onSuccess: () => {
        toast.add({ title: "Portfolio item removed", type: "success" });
        setPendingDelete(null);
      },
      onError: (err) => {
        toast.add({
          title: "Could not remove portfolio item",
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
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>
              Photos from past events — the first few shape how clients see your
              profile.
            </CardDescription>
          </div>
          <Button
            onClick={() => setDialog({ open: true, item: null })}
            disabled={isPending || isError}
          >
            <PlusIcon /> Add item
          </Button>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <PortfolioSkeleton />
          ) : isError ? (
            <ErrorState
              title="Could not load your portfolio"
              error={error}
              onRetry={refetch}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="No portfolio items yet"
              description="Add photos from past events to show clients what you can do."
              action={
                <Button onClick={() => setDialog({ open: true, item: null })}>
                  <PlusIcon /> Add item
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  onEdit={() => setDialog({ open: true, item })}
                  onDelete={() => setPendingDelete(item)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {dialog.open ? (
        <PortfolioForm
          item={dialog.item}
          open={dialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setDialog({ open: false, item: null });
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
        title="Delete this portfolio item?"
        description={`"${pendingDelete?.title ?? ""}" will be removed from your profile permanently.`}
        confirmLabel="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
