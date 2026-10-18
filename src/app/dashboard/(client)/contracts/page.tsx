import type { Metadata } from "next";
import { ContractList } from "@/components/modules/contracts/ContractList";

export const metadata: Metadata = {
  title: "Contracts",
  description:
    "Track every contract you signed — payments, deliverables and completion.",
};

export default function ContractsPage() {
  return <ContractList />;
}
