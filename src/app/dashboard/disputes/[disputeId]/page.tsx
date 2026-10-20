import type { Metadata } from "next";
import { DisputeDetail } from "@/components/modules/disputes/DisputeDetail";
import { staticExportParams } from "@/lib/static-params";

export const metadata: Metadata = {
  title: "Dispute",
  description: "View dispute details, evidence, and resolution.",
};

export function generateStaticParams() {
  return staticExportParams("disputeId");
}

type DisputeDetailPageProps = {
  params: Promise<{ disputeId: string }>;
};

export default async function DisputeDetailPage({
  params,
}: DisputeDetailPageProps) {
  const { disputeId } = await params;

  return <DisputeDetail disputeId={disputeId} />;
}
