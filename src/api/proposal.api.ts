import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  Contract,
  CreateProposalPayload,
  Proposal,
  ProposalItem,
} from "@/types";

export function createProposal(payload: CreateProposalPayload) {
  return apiClient<ApiResponse<Proposal>>(
    `/proposal/events/${payload.eventId}`,
    {
      method: "POST",
      body: { message: payload.message, items: payload.items },
    },
  );
}

export function getMyProposals() {
  return apiClient<ApiResponse<Proposal[]>>("/proposal/me");
}

export function withdrawProposal(proposalId: string) {
  return apiClient<ApiResponse<ProposalItem | ProposalItem[]>>(
    `/proposal/${proposalId}/withdraw`,
    { method: "PATCH" },
  );
}

export function getRequirementProposals(requirementId: string) {
  return apiClient<ApiResponse<Proposal[]>>(
    `/proposal/requirements/${requirementId}`,
  );
}

export function getProposal(proposalId: string) {
  return apiClient<ApiResponse<Proposal>>(`/proposal/${proposalId}`);
}

export function acceptProposal(proposalId: string) {
  return apiClient<ApiResponse<Contract | Contract[]>>(
    `/proposal/${proposalId}/accept`,
    { method: "PATCH" },
  );
}

export function rejectProposal(proposalId: string) {
  return apiClient<ApiResponse<ProposalItem | ProposalItem[]>>(
    `/proposal/${proposalId}/reject`,
    { method: "PATCH" },
  );
}
