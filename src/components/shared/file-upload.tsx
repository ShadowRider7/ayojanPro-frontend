"use client";

import { FileTextIcon, UploadCloudIcon, XIcon } from "lucide-react";
import type * as React from "react";
import { useCallback, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/utils/file-size.util";

type FileUploadProps = {
  value?: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  /** Maximum size per file, in megabytes. */
  maxSizeMB?: number;
  prompt?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

/** Drag-and-drop / click file picker with per-file size validation. */
export function FileUpload({
  value = [],
  onChange,
  accept,
  multiple = false,
  maxSizeMB = 5,
  prompt = "Click to upload or drag and drop",
  description,
  disabled = false,
  className,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxBytes = maxSizeMB * 1024 * 1024;

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      const tooLarge = list.find((file) => file.size > maxBytes);

      if (tooLarge) {
        setError(`${tooLarge.name} is larger than ${maxSizeMB} MB.`);
        return;
      }

      setError(null);

      const seen = new Set<string>();
      const next = (multiple ? [...value, ...list] : list.slice(0, 1)).filter(
        (file) => {
          const key = `${file.name}-${file.size}`;

          if (seen.has(key)) {
            return false;
          }

          seen.add(key);
          return true;
        },
      );

      onChange(next);
    },
    [maxBytes, maxSizeMB, multiple, onChange, value],
  );

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);

    if (!disabled && event.dataTransfer.files?.length) {
      addFiles(event.dataTransfer.files);
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setDragActive(true);
          }
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
          dragActive ? "border-ring bg-muted/50" : "border-input",
          disabled ? "cursor-not-allowed opacity-60" : "hover:bg-muted/40",
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) {
              addFiles(event.target.files);
            }
            // Allow re-selecting the same file later.
            event.target.value = "";
          }}
        />
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UploadCloudIcon className="size-5" />
        </span>
        <span className="text-sm font-medium">{prompt}</span>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {value.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
            >
              <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm">
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={() => removeAt(index)}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
