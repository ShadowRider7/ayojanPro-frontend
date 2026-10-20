import type { Metadata } from "next";
import { ProposalDetail } from "@/components/modules/proposals/ProposalDetail";
import { staticExportParams } from "@/lib/static-params";

export const metadata: Metadata = {
  title: "Proposal",
  description:
    "Review a proposal's items, then accept it to create contracts or reject it.",
};

export function generateStaticParams() {
  return staticExportParams("proposalId");
}

type ProposalDetailPageProps = {
  params: Promise<{ proposalId: string }>;
};

export default async function ProposalDetailPage({
  params,
}: ProposalDetailPageProps) {
  const { proposalId } = await params;

  return <ProposalDetail proposalId={proposalId} />;
}
