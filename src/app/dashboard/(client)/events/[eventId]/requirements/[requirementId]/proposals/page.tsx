import type { Metadata } from "next";
import { ProposalList } from "@/components/modules/proposals/ProposalList";

export const metadata: Metadata = {
  title: "Proposals",
  description:
    "Review the proposals professionals submitted for a service requirement.",
};

type RequirementProposalsPageProps = {
  params: Promise<{ eventId: string; requirementId: string }>;
};

export default async function RequirementProposalsPage({
  params,
}: RequirementProposalsPageProps) {
  const { eventId, requirementId } = await params;

  return <ProposalList eventId={eventId} requirementId={requirementId} />;
}
