import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";

type CurrencyTextProps = {
  value: number | string | null | undefined;
  currency?: string;
  maximumFractionDigits?: number;
  className?: string;
};

export function CurrencyText({
  value,
  currency,
  maximumFractionDigits,
  className,
}: CurrencyTextProps) {
  return (
    <span className={cn("tabular-nums", className)}>
      {formatCurrency(value, { currency, maximumFractionDigits })}
    </span>
  );
}
