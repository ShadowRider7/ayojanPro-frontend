import type { Metadata } from "next";
import { getPublicProfessional } from "@/api";
import ProfessionalProfile from "@/components/modules/professionals/ProfessionalProfile";

export function generateStaticParams() {
  return [{ professionalId: "placeholder" }];
}

type ProfessionalProfilePageProps = {
  params: Promise<{ professionalId: string }>;
};

export async function generateMetadata({
  params,
}: ProfessionalProfilePageProps): Promise<Metadata> {
  const { professionalId } = await params;

  try {
    const { data: professional } = await getPublicProfessional(professionalId);

    return {
      title: `${professional.name} — ${professional.professionalTitle}`,
      description:
        professional.bio ??
        `View ${professional.name}'s services, experience, portfolio and reviews on AyojanPro.`,
    };
  } catch {
    return {
      title: "Professional profile",
      description:
        "View an event professional's services, experience, portfolio and reviews on AyojanPro.",
    };
  }
}

export default async function ProfessionalProfilePage({
  params,
}: ProfessionalProfilePageProps) {
  const { professionalId } = await params;

  return <ProfessionalProfile professionalId={professionalId} />;
}
