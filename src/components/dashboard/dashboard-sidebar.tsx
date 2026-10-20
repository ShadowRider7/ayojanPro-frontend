"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DASHBOARD_ROUTES } from "@/lib/constants";
import { adminRoutes, clientRoutes, professionalRoutes } from "@/routes";
import type { Role } from "@/types";
import type { SidebarItems } from "@/types/sidebar.type";

const SIDEBAR_ROUTES: Record<Role, SidebarItems> = {
  ADMIN: adminRoutes,
  CLIENT: clientRoutes,
  PROFESSIONAL: professionalRoutes,
};

function isActiveItem(pathname: string, url: string, root: string) {
  return pathname === url || (url !== root && pathname.startsWith(`${url}/`));
}

export function DashboardSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const routes = SIDEBAR_ROUTES[role];
  const root = DASHBOARD_ROUTES[role];

  return (
    <Sidebar>
      <SidebarContent>
        {routes.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActiveItem(pathname, item.url, root)}
                    >
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
