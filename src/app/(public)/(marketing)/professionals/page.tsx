import type { Metadata } from "next";
import { Suspense } from "react";
import ProfessionalDirectory, {
  ProfessionalDirectorySkeleton,
} from "@/components/modules/professionals/ProfessionalDirectory";

export const metadata: Metadata = {
  title: "Browse event professionals",
  description:
    "Search verified, approved event professionals on AyojanPro — photographers, decorators, makeup artists, DJs and more — and compare services, experience and reviews.",
  openGraph: {
    type: "website",
    siteName: "AyojanPro",
    title: "Browse event professionals | AyojanPro",
    description:
      "Search verified event professionals and compare services, experience and reviews.",
  },
};

export default function ProfessionalsPage() {
  return (
    <Suspense fallback={<ProfessionalDirectorySkeleton />}>
      <ProfessionalDirectory />
    </Suspense>
  );
}
