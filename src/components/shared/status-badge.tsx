"use client";

import { Badge } from "@/components/ui/badge";
import { type StatusTone, statusTone } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { humanize } from "@/utils/formatters";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  info: "border-transparent bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  success:
    "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  destructive:
    "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
};

type StatusBadgeProps = {
  status?: string | null;

  label?: string;

  tone?: StatusTone;
  className?: string;
};

export function StatusBadge({
  status,
  label,
  tone,
  className,
}: StatusBadgeProps) {
  if (!status && !label) {
    return null;
  }

  const resolvedTone = tone ?? statusTone(status);

  return (
    <Badge
      variant="outline"
      className={cn(TONE_CLASSES[resolvedTone], className)}
    >
      {label ?? humanize(status)}
    </Badge>
  );
}
