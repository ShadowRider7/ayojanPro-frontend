import type { Metadata } from "next";
import ProfessionalProfile from "@/components/modules/professionals/ProfessionalProfile";
import { staticExportParams } from "@/lib/static-params";

export const metadata: Metadata = {
  title: "Professional profile",
  description:
    "View a professional's services, experience, portfolio and reviews without leaving your dashboard.",
};

/**
 * A static export has no server to render the route on demand, and Next.js
 * rejects a `generateStaticParams()` that returns an empty array:
 * "With `output: export`, at least one route must be generated."
 *
 * The placeholder gives the route one path to be exported under. The real
 * professional id arrives on the client, so the page renders for any id.
 */
export function generateStaticParams() {
  return staticExportParams("professionalId");
}

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
