import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  Dispute,
  IQuery,
  RaiseDisputePayload,
  ResolveDisputePayload,
  UpdateDisputeStatusPayload,
} from "@/types";

export function raiseDispute(
  contractId: string,
  { reason, description, evidence }: RaiseDisputePayload & { evidence: File[] },
) {
  const body = new FormData();
  body.append("reason", reason);
  body.append("description", description);
  for (const file of evidence) {
    body.append("evidence", file);
  }

  return apiClient<ApiResponse<Dispute>>(`/dispute/contracts/${contractId}`, {
    method: "POST",
    body,
  });
}

export function getDispute(disputeId: string) {
  return apiClient<ApiResponse<Dispute>>(`/dispute/${disputeId}`);
}

export function listDisputes(query?: IQuery) {
  return apiClient<ApiResponse<Dispute[]>>("/dispute", { query });
}

export function updateDisputeStatus(
  disputeId: string,
  payload: UpdateDisputeStatusPayload,
) {
  return apiClient<ApiResponse<Dispute>>(`/dispute/${disputeId}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function resolveDispute(
  disputeId: string,
  payload: ResolveDisputePayload,
) {
  return apiClient<ApiResponse<Dispute>>(`/dispute/${disputeId}/resolve`, {
    method: "PATCH",
    body: payload,
  });
}
