import type { Metadata } from "next";
import { Suspense } from "react";
import ProfessionalDirectory, {
  ProfessionalDirectorySkeleton,
} from "@/components/modules/professionals/ProfessionalDirectory";

export const metadata: Metadata = {
  title: "Browse professionals",
  description:
    "Search verified, approved event professionals — photographers, decorators, makeup artists, DJs and more — and compare services, experience and reviews.",
};

export default function DashboardProfessionalsPage() {
  return (
    <Suspense fallback={<ProfessionalDirectorySkeleton variant="dashboard" />}>
      <ProfessionalDirectory
        variant="dashboard"
        profileBasePath="/dashboard/professionals"
      />
    </Suspense>
  );
}
