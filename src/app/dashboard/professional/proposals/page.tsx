import type { Metadata } from "next";
import { MyProposals } from "@/components/modules/proposals/MyProposals";

export const metadata: Metadata = {
  title: "My Proposals",
  description:
    "Track every proposal you sent to clients, or withdraw the pending ones.",
};

export default function MyProposalsPage() {
  return <MyProposals />;
}
