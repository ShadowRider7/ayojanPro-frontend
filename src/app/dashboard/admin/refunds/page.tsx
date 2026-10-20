import type { Metadata } from "next";
import { AdminRefunds } from "@/components/modules/admin/AdminRefunds";

export const metadata: Metadata = {
  title: "Refunds",
  description:
    "Money returned to clients when a contract is cancelled by the professional or by an admin.",
};

export default function AdminRefundsPage() {
  return <AdminRefunds />;
}
