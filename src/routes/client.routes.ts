import type { SidebarItems } from "@/types/sidebar.type";

const prefix = "/dashboard";

export const clientRoutes: SidebarItems = [
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
    title: "Events",
    items: [
      {
        title: "My Events",
        url: `${prefix}/events`,
      },
      {
        title: "Browse Professionals",
        url: `${prefix}/professionals`,
      },
    ],
  },
  {
    title: "Contracts",
    items: [
      {
        title: "Contracts",
        url: `${prefix}/contracts`,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: `${prefix}/profile`,
      },
      {
        title: "Notifications",
        url: `${prefix}/notifications`,
      },
    ],
  },
];
