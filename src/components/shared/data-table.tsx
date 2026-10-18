"use client";

import type * as React from "react";
import { useMemo } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[] | null | undefined;

  getRowKey: (row: T, index: number) => React.Key;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;

  emptyState?: React.ReactNode;
  skeletonRows?: number;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  isLoading = false,
  error,
  onRetry,
  emptyState,
  skeletonRows = 5,
  className,
}: DataTableProps<T>) {
  const rows = useMemo(() => data ?? [], [data]);
  const skeletonKeys = useMemo(
    () => Array.from({ length: skeletonRows }, (_, index) => `row-${index}`),
    [skeletonRows],
  );

  if (error) {
    return (
      <ErrorState
        className={cn("rounded-xl border", className)}
        error={error}
        onRetry={onRetry}
      />
    );
  }

  let body: React.ReactNode;

  if (isLoading) {
    body = skeletonKeys.map((skeletonKey) => (
      <TableRow key={skeletonKey}>
        {columns.map((column) => (
          <TableCell key={column.id} className={column.className}>
            <Skeleton className="h-4 w-full max-w-32" />
          </TableCell>
        ))}
      </TableRow>
    ));
  } else if (rows.length === 0) {
    body = (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={columns.length} className="p-0">
          {emptyState ?? (
            <EmptyState
              className="border-0"
              title="Nothing here yet"
              description="Items will appear here once available."
            />
          )}
        </TableCell>
      </TableRow>
    );
  } else {
    body = rows.map((row, index) => (
      <TableRow key={getRowKey(row, index)}>
        {columns.map((column) => (
          <TableCell key={column.id} className={column.className}>
            {column.cell(row)}
          </TableCell>
        ))}
      </TableRow>
    ));
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{body}</TableBody>
      </Table>
    </div>
  );
}
