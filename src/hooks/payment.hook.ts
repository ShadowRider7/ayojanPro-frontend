import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getContractPayments,
  initiateFinalPayment,
  initiateInitialPayment,
} from "@/api";

export function useContractPayments(contractId: string) {
  return useQuery({
    queryKey: ["payments", contractId],
    queryFn: () => getContractPayments(contractId),
    enabled: Boolean(contractId),
  });
}

export function useInitiateInitialPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initiateInitialPayment,
    onSuccess: (_data, contractId) => {
      queryClient.invalidateQueries({ queryKey: ["payments", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useInitiateFinalPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initiateFinalPayment,
    onSuccess: (_data, contractId) => {
      queryClient.invalidateQueries({ queryKey: ["payments", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
