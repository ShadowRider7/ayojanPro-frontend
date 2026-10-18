import apiClient from "@/lib/apiClient";
import type { ApiResponse, InitiatePaymentResult, Payment } from "@/types";

export function initiateInitialPayment(contractId: string) {
  return apiClient<ApiResponse<InitiatePaymentResult>>(
    `/payment/contracts/${contractId}/initial`,
    { method: "POST" },
  );
}

export function initiateFinalPayment(contractId: string) {
  return apiClient<ApiResponse<InitiatePaymentResult>>(
    `/payment/contracts/${contractId}/final`,
    { method: "POST" },
  );
}

export function getContractPayments(contractId: string) {
  return apiClient<ApiResponse<Payment[]>>(`/payment/contracts/${contractId}`);
}
