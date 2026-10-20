"use client";

import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGoBack } from "@/providers/navigation.provider";

type BackButtonProps = {
  /**
   * Where to go when the visitor arrived on this page directly, so there is
   * no page to go back to.
   */
  fallbackHref: string;

  label?: string;
  variant?: "ghost" | "outline" | "link";
  className?: string;
};

/**
 * The button that returns to the previous page.
 *
 * It follows the browser history, so the visitor lands where they came
 * from — the events list they opened the event from, not a fixed route.
 */
export function BackButton({
  fallbackHref,
  label = "Back",
  variant = "ghost",
  className,
}: BackButtonProps) {
  const goBack = useGoBack();

  return (
    <Button
      variant={variant}
      size="sm"
      className={cn("w-fit", className)}
      onClick={() => goBack(fallbackHref)}
    >
      <ArrowLeftIcon />
      {label}
    </Button>
  );
}
