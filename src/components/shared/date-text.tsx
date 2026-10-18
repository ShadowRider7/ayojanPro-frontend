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

  mode?: "date" | "datetime" | "relative";
  className?: string;
};

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
