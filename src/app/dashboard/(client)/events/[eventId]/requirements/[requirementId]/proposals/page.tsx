import type { Metadata } from "next";
import { ProposalList } from "@/components/modules/proposals/ProposalList";

export const metadata: Metadata = {
  title: "Proposals",
  description:
    "Review the proposals professionals submitted for a service requirement.",
};

export function generateStaticParams() {
  return [{ eventId: "placeholder", requirementId: "placeholder" }];
}

type RequirementProposalsPageProps = {
  params: Promise<{ eventId: string; requirementId: string }>;
};

export default async function RequirementProposalsPage({
  params,
}: RequirementProposalsPageProps) {
  const { eventId, requirementId } = await params;

  return <ProposalList eventId={eventId} requirementId={requirementId} />;
}
