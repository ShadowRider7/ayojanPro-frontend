import type { SidebarItems } from "@/types/sidebar.type";

const prefix = "/dashboard/professional";

export const professionalRoutes: SidebarItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: prefix,
      },
    ],
  },
  {
    title: "Work",
    items: [
      {
        title: "Browse Events",
        url: `${prefix}/browse-events`,
      },
      {
        title: "My Proposals",
        url: `${prefix}/proposals`,
      },
      {
        title: "Contracts",
        url: "/dashboard/contracts",
      },
    ],
  },
  {
    title: "Profile",
    items: [
      {
        title: "Services",
        url: `${prefix}/services`,
      },
      {
        title: "My Profile",
        url: `${prefix}/profile`,
      },
      {
        title: "Notifications",
        url: "/dashboard/notifications",
      },
    ],
  },
];
