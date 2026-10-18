import { useMutation, useQuery } from "@tanstack/react-query";
import {
  acceptProposal,
  getProposal,
  getRequirementProposals,
  rejectProposal,
} from "@/api";

/**
 * Proposals for one service requirement (`GET /proposal/requirements/:id`).
 * Both proposal queries share the `["proposals"]` prefix, so one
 * invalidation refreshes the requirement list and the detail screen together.
 */
export function useRequirementProposals(requirementId: string) {
  return useQuery({
    queryKey: ["proposals", "requirement", requirementId],
    queryFn: () => getRequirementProposals(requirementId),
    enabled: Boolean(requirementId),
  });
}

/** One proposal with every item (`GET /proposal/:id`). */
export function useProposal(proposalId: string) {
  return useQuery({
    queryKey: ["proposals", proposalId],
    queryFn: () => getProposal(proposalId),
    enabled: Boolean(proposalId),
  });
}

/** Accept a whole proposal — creates one contract per pending item. */
export function useAcceptProposal() {
  return useMutation({
    mutationFn: acceptProposal,
  });
}

/** Reject a whole proposal — rejects every pending item. */
export function useRejectProposal() {
  return useMutation({
    mutationFn: rejectProposal,
  });
}
