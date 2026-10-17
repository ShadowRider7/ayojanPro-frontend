import type { Metadata } from "next";
import { AdminOverview } from "@/components/modules/overview/AdminOverview";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Platform-wide AyojanPro activity — users, events, contracts, disputes and revenue.",
};

export default function AdminDashboardPage() {
  return <AdminOverview />;
}
