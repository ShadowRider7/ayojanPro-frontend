"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectOption } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SelectFilterProps = {
  /** The options to pick from, usually built with `withAllOption`. */
  items: SelectOption[];

  /** The currently selected value. */
  value: string;

  /**
   * Called with the new value. The "no filter" entry is the literal
   * `"all"`, which is what every list screen uses.
   */
  onChange: (value: string) => void;

  /** The accessible name of the trigger. */
  label: string;

  /** The text shown while nothing is selected. */
  placeholder?: string;

  className?: string;
  triggerClassName?: string;
};

/**
 * A single-select filter.
 *
 * Every list screen filters by status, role or stage with the same
 * control, so it lives in one place instead of being copy-pasted.
 */
export function SelectFilter({
  items,
  value,
  onChange,
  label,
  placeholder = "All",
  className,
  triggerClassName,
}: SelectFilterProps) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => onChange(next ?? "all")}
    >
      <SelectTrigger
        className={cn("w-full sm:w-44", className, triggerClassName)}
        aria-label={label}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
