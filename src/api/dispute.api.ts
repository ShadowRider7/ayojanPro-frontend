import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  Dispute,
  IQuery,
  RaiseDisputePayload,
  ResolveDisputePayload,
  UpdateDisputeStatusPayload,
} from "@/types";

/**
 * `POST /dispute/contracts/:id` — raise a dispute against a contract.
 * Only the client or professional on the contract can raise one; the contract
 * must not be cancelled and must not already have an active dispute. Evidence
 * files travel as multipart `evidence` fields (at least one required).
 */
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

/** `GET /dispute/:id` — dispute details (party or admin only). */
export function getDispute(disputeId: string) {
  return apiClient<ApiResponse<Dispute>>(`/dispute/${disputeId}`);
}

/** `GET /dispute` — admin list of all disputes, optionally filtered by status. */
export function listDisputes(query?: IQuery) {
  return apiClient<ApiResponse<Dispute[]>>("/dispute", { query });
}

/** `PATCH /dispute/:id/status` — admin-only status transition. */
export function updateDisputeStatus(
  disputeId: string,
  payload: UpdateDisputeStatusPayload,
) {
  return apiClient<ApiResponse<Dispute>>(`/dispute/${disputeId}/status`, {
    method: "PATCH",
    body: payload,
  });
}

/** `PATCH /dispute/:id/resolve` — admin resolves a dispute with a summary. */
export function resolveDispute(
  disputeId: string,
  payload: ResolveDisputePayload,
) {
  return apiClient<ApiResponse<Dispute>>(`/dispute/${disputeId}/resolve`, {
    method: "PATCH",
    body: payload,
  });
}
