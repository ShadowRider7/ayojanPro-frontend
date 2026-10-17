import type { Metadata } from "next";
import { ClientOverview } from "@/components/modules/overview/ClientOverview";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your AyojanPro events, contracts and spending at a glance.",
};

export default function ClientDashboardPage() {
  return <ClientOverview />;
}
