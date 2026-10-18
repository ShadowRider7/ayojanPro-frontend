import type { Metadata } from "next";
import { AdminContracts } from "@/components/modules/admin/AdminContracts";

export const metadata: Metadata = {
  title: "Contracts",
  description:
    "All contracts on the platform — track their lifecycle, payments, and deliverables.",
};

export default function AdminContractsPage() {
  return <AdminContracts />;
}
