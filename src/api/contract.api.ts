import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  CancelContractPayload,
  Contract,
  Deliverable,
} from "@/types";

/**
 * `GET /contract` — the signed-in user's contracts (clients see their own,
 * professionals their own, admins everything), newest first, each with the
 * client, professional, event, requirement, service, proposal item, payment
 * attempts and deliverable embedded. The backend does not paginate.
 */
export function getContracts() {
  return apiClient<ApiResponse<Contract[]>>("/contract");
}

/**
 * `GET /contract/:id` — one contract with every relation the list view has.
 * 403 when the caller is not a party to it (admins see everything).
 */
export function getContract(contractId: string) {
  return apiClient<ApiResponse<Contract>>(`/contract/${contractId}`);
}

/**
 * `PATCH /contract/:id/cancel` — cancel a live contract (client or
 * professional). Only `PENDING`, `CONFIRMED` and `IN_PROGRESS` contracts
 * can be cancelled; the requirement re-opens for new proposals and the
 * other party is notified. `reason` (≤ 2000 chars) is optional.
 */
export function cancelContract(
  contractId: string,
  payload: CancelContractPayload = {},
) {
  return apiClient<ApiResponse<Contract>>(`/contract/${contractId}/cancel`, {
    method: "PATCH",
    body: payload,
  });
}

/**
 * `GET /contract/:id/deliverable` — the professional's submitted work
 * (title, description, external links), or `null` before anything was
 * submitted. Also embedded in the contract detail as `deliverables`, but
 * wired as its own query so the panel has independent loading/error state.
 */
export function getContractDeliverable(contractId: string) {
  return apiClient<ApiResponse<Deliverable | null>>(
    `/contract/${contractId}/deliverable`,
  );
}

/**
 * `PATCH /contract/:id/complete` — mark a delivered contract completed
 * (client/admin). The backend requires the final (70%) payment to be
 * `COMPLETED` first — normally the bKash callback flips the contract to
 * `COMPLETED` on its own, so this is the manual fallback.
 */
export function completeContract(contractId: string) {
  return apiClient<ApiResponse<Contract>>(`/contract/${contractId}/complete`, {
    method: "PATCH",
  });
}
