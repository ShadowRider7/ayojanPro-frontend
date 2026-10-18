import type { Metadata } from "next";
import { DisputeDetail } from "@/components/modules/disputes/DisputeDetail";

export const metadata: Metadata = {
  title: "Dispute",
  description: "View dispute details, evidence, and resolution.",
};

export default function DisputeDetailPage({
  params,
}: {
  params: Promise<{ disputeId: string }>;
}) {
  return <DisputeDetailWrapper params={params} />;
}

async function DisputeDetailWrapper({
  params,
}: {
  params: Promise<{ disputeId: string }>;
}) {
  const { disputeId } = await params;
  return <DisputeDetail disputeId={disputeId} />;
}
