import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-6">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldAlert className="size-8 text-destructive" />
        </div>
        <div className="space-y-1">
          <h1 className="font-semibold text-lg">
            You do not have access to this page
          </h1>
          <p className="text-muted-foreground text-sm">
            Go back to{" "}
            <Link href="/" className="underline underline-offset-4">
              home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
