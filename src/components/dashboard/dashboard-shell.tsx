"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetMe } from "@/hooks";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

/**
 * Dashboard chrome — the role sidebar plus a topbar with the notification bell
 * and account menu. Mounted by `(dashboard)/layout.tsx` behind `AuthGuard`, so
 * the session (and therefore the role) is always resolved by the time this
 * renders; the same `["user"]` query is already cached.
 */
export default function DashboardShell({ children }: { children: ReactNode }) {
  const { data } = useGetMe();

  const user = data?.data;

  return (
    <SidebarProvider>
      {user ? <DashboardSidebar role={user.role} /> : null}
      <SidebarInset>
        <DashboardTopbar />
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
