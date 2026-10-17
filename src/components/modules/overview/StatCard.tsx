import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  /** Small line under the value, e.g. `"3 active"`. */
  hint?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
};

/** One headline number on a dashboard overview screen. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card size="sm" className={cn("gap-2", className)}>
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          {Icon ? (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
          ) : null}
        </div>
        <p className="font-heading text-2xl font-semibold tabular-nums">
          {value}
        </p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

/** Loading placeholder matching `StatCard`'s footprint. */
export function StatCardSkeleton() {
  return (
    <Card size="sm" className="gap-2">
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-16" />
      </CardContent>
    </Card>
  );
}
