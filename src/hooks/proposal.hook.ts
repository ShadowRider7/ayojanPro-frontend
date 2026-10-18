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

export function useMyProposals() {
  return useQuery<ApiResponse<Proposal[]>>({
    queryKey: ["proposals", "mine"],
    queryFn: getMyProposals,
  });
}

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

export function useRequirementProposals(requirementId: string) {
  return useQuery({
    queryKey: ["proposals", "requirement", requirementId],
    queryFn: () => getRequirementProposals(requirementId),
    enabled: Boolean(requirementId),
  });
}

export function useProposal(proposalId: string) {
  return useQuery({
    queryKey: ["proposals", proposalId],
    queryFn: () => getProposal(proposalId),
    enabled: Boolean(proposalId),
  });
}

export function useAcceptProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useRejectProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
