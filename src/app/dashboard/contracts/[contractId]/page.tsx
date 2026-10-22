import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ContractDetail,
  ContractDetailSkeleton,
} from "@/components/modules/contracts/ContractDetail";

export const metadata: Metadata = {
  title: "Contract",
  description:
    "Pay for a contract through bKash, review its deliverable, then complete or cancel it.",
};

type ContractDetailPageProps = {
  params: Promise<{ contractId: string }>;
};

export default async function ContractDetailPage({
  params,
}: ContractDetailPageProps) {
  const { contractId } = await params;

  return (
    <Suspense fallback={<ContractDetailSkeleton />}>
      <ContractDetail contractId={contractId} />
    </Suspense>
  );
}
