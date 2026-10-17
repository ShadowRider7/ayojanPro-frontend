"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type PageItem = number | "ellipsis-left" | "ellipsis-right";

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/** Compact page list, e.g. `1 … 4 5 6 … 20`. */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PageItem[] {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + siblingCount * 2;
    return [...range(1, leftItemCount), "ellipsis-right", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + siblingCount * 2;
    return [
      1,
      "ellipsis-left",
      ...range(totalPages - rightItemCount + 1, totalPages),
    ];
  }

  return [
    1,
    "ellipsis-left",
    ...range(leftSibling, rightSibling),
    "ellipsis-right",
    totalPages,
  ];
}

type PaginationBarProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  /** Show a `Showing x–y of z` summary (requires `totalItems`, `pageSize`). */
  showSummary?: boolean;
  totalItems?: number;
  pageSize?: number;
  className?: string;
};

/** Page controls built on the shadcn pagination primitives. */
export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showSummary = false,
  totalItems,
  pageSize,
  className,
}: PaginationBarProps) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPageRange(page, totalPages, siblingCount);
  const summary =
    showSummary && totalItems !== undefined && pageSize
      ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalItems)} of ${totalItems}`
      : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 sm:flex-row sm:justify-between",
        className,
      )}
    >
      {summary ? (
        <p className="text-sm text-muted-foreground">{summary}</p>
      ) : null}
      <Pagination
        className={cn("mx-0 w-auto", summary ? undefined : "sm:ml-auto")}
      >
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Go to previous page"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeftIcon />
            </Button>
          </PaginationItem>
          {items.map((item) =>
            typeof item === "number" ? (
              <PaginationItem key={`page-${item}`}>
                <Button
                  variant={item === page ? "outline" : "ghost"}
                  size="icon"
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationEllipsis />
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Go to next page"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
