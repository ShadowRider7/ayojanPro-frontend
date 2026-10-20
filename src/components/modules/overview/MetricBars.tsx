import { EmptyState } from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StatusTone } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type MetricBarDatum = {
  label: string;
  value: number;

  tone?: StatusTone | "primary";

  format?: (value: number) => string;
};

type MetricBarsProps = {
  title: string;
  description?: string;
  data: MetricBarDatum[];
  className?: string;
};

const BAR_TONE_CLASSES: Record<StatusTone | "primary", string> = {
  primary: "bg-primary",
  neutral: "bg-muted-foreground/40",
  info: "bg-sky-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
};

export function MetricBars({
  title,
  description,
  data,
  className,
}: MetricBarsProps) {
  const max = Math.max(0, ...data.map((datum) => datum.value));

  return (
    <Card size="sm" className={cn("gap-2", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            title="Nothing to show yet"
            description="Figures will appear here once there is activity."
            className="border-0 py-6"
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {data.map((datum) => {
              const readout = datum.format
                ? datum.format(datum.value)
                : datum.value;
              const width = max > 0 ? (datum.value / max) * 100 : 0;

              return (
                <li key={datum.label} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">{datum.label}</span>
                    <span className="font-medium tabular-nums">{readout}</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "h-full rounded-full",
                        BAR_TONE_CLASSES[datum.tone ?? "primary"],
                      )}
                      style={{ width: `${Math.round(width)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
