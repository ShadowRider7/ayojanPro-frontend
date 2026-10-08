"use client";

import type { ReactNode } from "react";
import type { UserRole } from "@/types";

export default function DashboardShell({
  userRole,
  children,
}: {
  userRole: UserRole;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
        <span className="font-heading text-sm font-medium capitalize">
          {userRole.toLowerCase()} dashboard
        </span>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
