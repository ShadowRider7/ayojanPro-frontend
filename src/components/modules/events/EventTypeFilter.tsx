"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_TYPE_OPTIONS } from "@/lib/constants";
import { ALL_EVENT_TYPES } from "@/utils";

export const EVENT_TYPE_FILTER_ITEMS: { value: string; label: string }[] = [
  { value: ALL_EVENT_TYPES, label: "All event types" },
  ...EVENT_TYPE_OPTIONS,
];

type EventTypeFilterProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/**
 * The event type filter. Both the public board and the professional
 * workspace offer the same closed set of options.
 */
export function EventTypeFilter({
  value,
  onChange,
  className,
}: EventTypeFilterProps) {
  return (
    <Select
      items={EVENT_TYPE_FILTER_ITEMS}
      value={value}
      onValueChange={(next) => onChange(next ?? ALL_EVENT_TYPES)}
    >
      <SelectTrigger
        className={className ?? "w-full sm:w-56"}
        aria-label="Filter by event type"
      >
        <SelectValue placeholder="All event types" />
      </SelectTrigger>
      <SelectContent>
        {EVENT_TYPE_FILTER_ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
