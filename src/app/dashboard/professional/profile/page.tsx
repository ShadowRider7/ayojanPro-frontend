import type { Metadata } from "next";
import { ProfessionalProfileManager } from "@/components/modules/profile/ProfessionalProfileManager";

export const metadata: Metadata = {
  title: "Professional Profile",
};

export default function ProfessionalProfilePage() {
  return <ProfessionalProfileManager />;
}
