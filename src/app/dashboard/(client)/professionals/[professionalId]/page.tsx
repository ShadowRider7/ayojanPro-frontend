import type { Metadata } from "next";
import ProfessionalProfile from "@/components/modules/professionals/ProfessionalProfile";

export const metadata: Metadata = {
  title: "Professional profile",
  description:
    "View a professional's services, experience, portfolio and reviews without leaving your dashboard.",
};

type DashboardProfessionalProfilePageProps = {
  params: Promise<{ professionalId: string }>;
};

export default async function DashboardProfessionalProfilePage({
  params,
}: DashboardProfessionalProfilePageProps) {
  const { professionalId } = await params;

  return (
    <ProfessionalProfile
      professionalId={professionalId}
      variant="dashboard"
      backHref="/dashboard/professionals"
    />
  );
}
