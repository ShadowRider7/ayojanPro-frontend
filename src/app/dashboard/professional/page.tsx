import type { Metadata } from "next";
import { ProfessionalOverview } from "@/components/modules/overview/ProfessionalOverview";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your AyojanPro services, proposals, contracts and earnings at a glance.",
};

export default function ProfessionalDashboardPage() {
  return <ProfessionalOverview />;
}
