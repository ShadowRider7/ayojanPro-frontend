import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptProposal,
  createProposal,
  getMyProposals,
  getProposal,
  getRequirementProposals,
  rejectProposal,
  withdrawProposal,
} from "@/api";
import type { ApiResponse, Proposal } from "@/types";

/**
 * The signed-in professional's proposals (`GET /proposal/me`, no
 * pagination). Every proposal query shares the `["proposals"]` prefix, so
 * one invalidation refreshes the list, the requirement lists and the detail
 * screens together.
 */
export function useMyProposals() {
  return useQuery<ApiResponse<Proposal[]>>({
    queryKey: ["proposals", "mine"],
    queryFn: getMyProposals,
  });
}

/**
 * Submit a proposal for an event. Accepting/rejecting responses flips the
 * requirement statuses shown on the event screens, so success refreshes both
 * the proposal and event key trees.
 */
export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/** Withdraw every pending item of one own proposal — the requirement re-opens. */
export function useWithdrawProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: withdrawProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

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
