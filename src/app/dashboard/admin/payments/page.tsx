import type { Metadata } from "next";
import { AdminPayments } from "@/components/modules/admin/AdminPayments";

export const metadata: Metadata = {
  title: "Payments",
  description:
    "All payment transactions on the platform — initial and final settlements.",
};

export default function AdminPaymentsPage() {
  return <AdminPayments />;
}
