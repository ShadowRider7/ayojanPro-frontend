"use client";

import type { ReactNode } from "react";
import { ErrorState } from "@/components/shared";
import { OverviewHeader } from "./OverviewHeader";
import { OverviewSkeleton } from "./OverviewSkeleton";

type OverviewViewProps = {
  description: ReactNode;

  isPending: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;

  children: ReactNode;
};

/**
 * The shell every role dashboard shares: the greeting, the loading state,
 * the error state and the content itself. Each role only supplies its own
 * cards and panels.
 */
export function OverviewView({
  description,
  isPending,
  isError,
  error,
  onRetry,
  children,
}: OverviewViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <OverviewHeader description={description} />

      {isPending ? (
        <OverviewSkeleton />
      ) : isError ? (
        <ErrorState
          title="Could not load your dashboard"
          error={error}
          onRetry={onRetry}
        />
      ) : (
        children
      )}
    </div>
  );
}
