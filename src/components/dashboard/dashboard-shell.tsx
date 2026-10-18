"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetMe } from "@/hooks";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

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
