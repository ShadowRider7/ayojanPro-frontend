import apiClient from "@/lib/apiClient";
import type { ApiResponse, InitiatePaymentResult, Payment } from "@/types";

/**
 * `POST /payment/contracts/:id/initial` — start the 30% advance through
 * bKash (client only; the contract must be `PENDING`). Responds with a
 * `{ paymentUrl }` the browser should navigate to; the bKash callback later
 * redirects back to `/dashboard/contracts/:id?payment=…`.
 */
export function initiateInitialPayment(contractId: string) {
  return apiClient<ApiResponse<InitiatePaymentResult>>(
    `/payment/contracts/${contractId}/initial`,
    { method: "POST" },
  );
}

/**
 * `POST /payment/contracts/:id/final` — start the remaining 70% (client
 * only; the contract must be `DELIVERED` and the initial payment settled).
 * Same `{ paymentUrl }` redirect contract as the initial payment.
 */
export function initiateFinalPayment(contractId: string) {
  return apiClient<ApiResponse<InitiatePaymentResult>>(
    `/payment/contracts/${contractId}/final`,
    { method: "POST" },
  );
}

/**
 * `GET /payment/contracts/:id` — payment attempts for one contract, oldest
 * first. The backend keeps a single row per contract that flips stage
 * (`INITIAL` → `FINAL`) as the two halves are attempted, so this is usually
 * 0–1 rows.
 */
export function getContractPayments(contractId: string) {
  return apiClient<ApiResponse<Payment[]>>(`/payment/contracts/${contractId}`);
}
