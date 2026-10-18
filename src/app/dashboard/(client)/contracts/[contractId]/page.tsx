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

  // ContractDetail reads the bKash callback's `?payment=` param through
  // `useSearchParams`, which needs a Suspense boundary under cacheComponents.
  return (
    <Suspense fallback={<ContractDetailSkeleton />}>
      <ContractDetail contractId={contractId} />
    </Suspense>
  );
}
