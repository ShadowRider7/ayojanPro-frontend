import type { Metadata } from "next";
import { AdminDisputes } from "@/components/modules/admin/AdminDisputes";

export const metadata: Metadata = {
  title: "Disputes",
  description:
    "Review and resolve disputes raised by clients and professionals.",
};

export default function AdminDisputesPage() {
  return <AdminDisputes />;
}
