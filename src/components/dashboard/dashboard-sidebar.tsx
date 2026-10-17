"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/assets/svg/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { APP_NAME, DASHBOARD_ROUTES } from "@/lib/constants";
import { adminRoutes, clientRoutes, professionalRoutes } from "@/routes";
import type { Role } from "@/types";
import type { SidebarItems } from "@/types/sidebar.type";

/** Role → sidebar config, mirroring the reference's `sidebarRoutes` map. */
const SIDEBAR_ROUTES: Record<Role, SidebarItems> = {
  ADMIN: adminRoutes,
  CLIENT: clientRoutes,
  PROFESSIONAL: professionalRoutes,
};

/**
 * Highlights a link on its own page and on nested screens, except for the
 * bare role dashboard (`/dashboard`, `/dashboard/professional`,
 * `/dashboard/admin`) which prefixes every other URL in the same sidebar.
 */
function isActiveItem(pathname: string, url: string, root: string) {
  return pathname === url || (url !== root && pathname.startsWith(`${url}/`));
}

export function DashboardSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const routes = SIDEBAR_ROUTES[role];
  const root = DASHBOARD_ROUTES[role];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" />}
              className="gap-2"
            >
              <Logo className="size-6 shrink-0 text-primary" />
              <span className="font-heading text-sm font-semibold tracking-tight">
                {APP_NAME}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
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
