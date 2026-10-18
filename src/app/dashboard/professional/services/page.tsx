import type { Metadata } from "next";
import { ServiceList } from "@/components/modules/services/ServiceList";
import { PageHeader } from "@/components/shared";

export const metadata: Metadata = {
  title: "My Services",
};

export default function ProfessionalServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My services"
        description="Manage the services clients see on your profile."
      />
      <ServiceList />
    </div>
  );
}
