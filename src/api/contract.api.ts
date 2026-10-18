import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  AttachDeliverablePayload,
  AttachDeliverableResult,
  CancelContractPayload,
  Contract,
  Deliverable,
} from "@/types";

export function getContracts() {
  return apiClient<ApiResponse<Contract[]>>("/contract");
}

export function getContract(contractId: string) {
  return apiClient<ApiResponse<Contract>>(`/contract/${contractId}`);
}

export function cancelContract(
  contractId: string,
  payload: CancelContractPayload = {},
) {
  return apiClient<ApiResponse<Contract>>(`/contract/${contractId}/cancel`, {
    method: "PATCH",
    body: payload,
  });
}

export function getContractDeliverable(contractId: string) {
  return apiClient<ApiResponse<Deliverable | null>>(
    `/contract/${contractId}/deliverable`,
  );
}

export function attachDeliverable(
  contractId: string,
  payload: AttachDeliverablePayload,
) {
  return apiClient<ApiResponse<AttachDeliverableResult>>(
    `/contract/${contractId}/deliverable`,
    {
      method: "POST",
      body: {
        title: payload.title,
        description: payload.description,
        externalUrl: payload.externalUrl
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      },
    },
  );
}

export function completeContract(contractId: string) {
  return apiClient<ApiResponse<Contract>>(`/contract/${contractId}/complete`, {
    method: "PATCH",
  });
}
