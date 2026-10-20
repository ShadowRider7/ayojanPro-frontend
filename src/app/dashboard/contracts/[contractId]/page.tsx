import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ContractDetail,
  ContractDetailSkeleton,
} from "@/components/modules/contracts/ContractDetail";
import { staticExportParams } from "@/lib/static-params";

export const metadata: Metadata = {
  title: "Contract",
  description:
    "Pay for a contract through bKash, review its deliverable, then complete or cancel it.",
};

export function generateStaticParams() {
  return staticExportParams("contractId");
}

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
