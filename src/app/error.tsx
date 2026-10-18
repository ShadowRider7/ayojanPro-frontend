"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <ErrorState title="Something went wrong" error={error} onRetry={reset} />
    </div>
  );
}
