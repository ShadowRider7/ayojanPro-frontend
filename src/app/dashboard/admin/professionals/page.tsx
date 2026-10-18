import type { Metadata } from "next";
import { ProfessionalApprovals } from "@/components/modules/admin/ProfessionalApprovals";

export const metadata: Metadata = {
  title: "Professionals",
  description:
    "Review professional applications, approve or reject candidates, and manage their status.",
};

export default function AdminProfessionalsPage() {
  return <ProfessionalApprovals />;
}
