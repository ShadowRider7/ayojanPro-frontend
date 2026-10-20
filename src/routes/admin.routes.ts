import type { SidebarItems } from "@/types/sidebar.type";

const prefix = "/dashboard/admin";

export const adminRoutes: SidebarItems = [
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
    title: "Management",
    items: [
      {
        title: "Professionals",
        url: `${prefix}/professionals`,
      },
      {
        title: "Users",
        url: `${prefix}/users`,
      },
      {
        title: "Events",
        url: `${prefix}/events`,
      },
      {
        title: "Contracts",
        url: `${prefix}/contracts`,
      },
      {
        title: "Payments",
        url: `${prefix}/payments`,
      },
      {
        title: "Refunds",
        url: `${prefix}/refunds`,
      },
      {
        title: "Disputes",
        url: `${prefix}/disputes`,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Notifications",
        url: "/dashboard/notifications",
      },
    ],
  },
];
