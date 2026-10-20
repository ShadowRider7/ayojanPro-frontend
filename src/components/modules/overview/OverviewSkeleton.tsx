import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./StatCard";

const STAT_SKELETON_KEYS = Array.from(
  { length: 6 },
  (_, index) => `stat-skeleton-${index}`,
);

const PANEL_SKELETON_KEYS = Array.from(
  { length: 4 },
  (_, index) => `panel-skeleton-${index}`,
);

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
