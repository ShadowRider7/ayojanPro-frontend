import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  href: string;
  label?: string;
  className?: string;
};

export function BackButton({
  href,
  label = "Back",
  className,
}: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("w-fit", className)}
      nativeButton={false}
      render={<Link href={href} />}
    >
      <ArrowLeftIcon />
      {label}
    </Button>
  );
}
