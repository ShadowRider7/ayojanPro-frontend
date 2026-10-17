"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@/utils/formatters";

type DateTextProps = {
  value: string | number | Date | null | undefined;
  /** `date` (default), `datetime`, or `relative`. */
  mode?: "date" | "datetime" | "relative";
  className?: string;
};

/**
 * Renders a date/time value with a sensible, consistent default format.
 *
 * `relative` mode reads the current time, which Next's cache components
 * forbid during prerender, so it resolves after mount and falls back to the
 * absolute date on first paint.
 */
export function DateText({ value, mode = "date", className }: DateTextProps) {
  const [relative, setRelative] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "relative") {
      return;
    }

    setRelative(formatRelativeTime(value));
  }, [value, mode]);

  let text: string;

  if (mode === "datetime") {
    text = formatDateTime(value);
  } else if (mode === "relative") {
    text = relative ?? formatDate(value);
  } else {
    text = formatDate(value);
  }

  return <span className={cn("whitespace-nowrap", className)}>{text}</span>;
}
