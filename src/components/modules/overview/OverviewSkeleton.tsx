import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./StatCard";

const STAT_SKELETON_KEYS = [
  "stat-skeleton-0",
  "stat-skeleton-1",
  "stat-skeleton-2",
  "stat-skeleton-3",
  "stat-skeleton-4",
  "stat-skeleton-5",
];

const PANEL_SKELETON_KEYS = [
  "panel-skeleton-0",
  "panel-skeleton-1",
  "panel-skeleton-2",
  "panel-skeleton-3",
];

export function OverviewSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_SKELETON_KEYS.map((key) => (
          <StatCardSkeleton key={key} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {PANEL_SKELETON_KEYS.map((key) => (
          <Card key={key} size="sm">
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
