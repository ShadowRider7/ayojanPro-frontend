"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;

  delay?: number;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  delay = 300,
  disabled = false,
  className,
  inputClassName,
}: SearchInputProps) {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (text === value) {
      return;
    }

    const timer = setTimeout(() => onChange(text), delay);

    return () => clearTimeout(timer);
  }, [text, value, delay, onChange]);

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        className={cn("pl-8", text ? "pr-8" : undefined, inputClassName)}
      />
      {text ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Clear search"
          disabled={disabled}
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
          onClick={() => {
            setText("");
            onChange("");
          }}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}
