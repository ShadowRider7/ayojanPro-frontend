import type { Metadata } from "next";
import { DisputeDetail } from "@/components/modules/disputes/DisputeDetail";

export const metadata: Metadata = {
  title: "Dispute",
  description: "View dispute details, evidence, and resolution.",
};

type DisputeDetailPageProps = {
  params: Promise<{ disputeId: string }>;
};

export default async function DisputeDetailPage({
  params,
}: DisputeDetailPageProps) {
  const { disputeId } = await params;

  return <DisputeDetail disputeId={disputeId} />;
}
