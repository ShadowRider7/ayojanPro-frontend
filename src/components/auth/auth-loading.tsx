import { LoaderIcon } from "lucide-react";

export default function AuthLoading({
  label = "Verifying account",
}: {
  label?: string;
}) {
  return (
    <div className="flex h-[calc(100dvh-var(--header-height))] w-full items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <LoaderIcon className="size-6 animate-spin" />
        {label}
      </div>
    </div>
  );
}
