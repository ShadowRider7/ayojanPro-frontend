import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getContractPayments,
  initiateFinalPayment,
  initiateInitialPayment,
} from "@/api";

/** Payment history for one contract (`GET /payment/contracts/:id`). */
export function useContractPayments(contractId: string) {
  return useQuery({
    queryKey: ["payments", contractId],
    queryFn: () => getContractPayments(contractId),
    enabled: Boolean(contractId),
  });
}

/** Start the 30% initial bKash payment — responds with `{ paymentUrl }`. */
export function useInitiateInitialPayment() {
  return useMutation({
    mutationFn: initiateInitialPayment,
  });
}

/** Start the 70% final bKash payment — responds with `{ paymentUrl }`. */
export function useInitiateFinalPayment() {
  return useMutation({
    mutationFn: initiateFinalPayment,
  });
}
