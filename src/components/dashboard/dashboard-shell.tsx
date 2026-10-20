"use client";

import type { ReactNode } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { useGetMe } from "@/hooks";
import { DashboardSidebar } from "./dashboard-sidebar";

/**
 * The dashboard app shell.
 *
 * The public header sits above this shell, so the shell fills the remaining
 * viewport height and the page keeps scrolling as one — the header stays
 * sticky and the sidebar stays fixed while the content scrolls.
 */
export default function DashboardShell({ children }: { children: ReactNode }) {
  const { data } = useGetMe();

  const user = data?.data;

  return (
    <div className="flex min-h-[calc(100dvh-var(--header-height))] w-full">
      {user ? <DashboardSidebar role={user.role} /> : null}
      <SidebarInset className="min-w-0">
        <div className="flex flex-col gap-6 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </div>
  );
}
