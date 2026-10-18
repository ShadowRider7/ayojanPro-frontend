import { useMutation, useQuery } from "@tanstack/react-query";
import {
  cancelContract,
  completeContract,
  getContract,
  getContractDeliverable,
  getContracts,
} from "@/api";
import type { CancelContractPayload } from "@/types";

/**
 * The signed-in user's contracts (`GET /contract`, no pagination). Every
 * contract query shares the `["contracts"]` prefix, so one invalidation
 * refreshes the list, the detail screen and its sub-panels together.
 */
export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });
}

/** One contract with payments, deliverable and both parties (`GET /contract/:id`). */
export function useContract(contractId: string) {
  return useQuery({
    queryKey: ["contracts", contractId],
    queryFn: () => getContract(contractId),
    enabled: Boolean(contractId),
  });
}

/** The professional's submitted deliverable, or null (`GET /contract/:id/deliverable`). */
export function useContractDeliverable(contractId: string) {
  return useQuery({
    queryKey: ["contracts", contractId, "deliverable"],
    queryFn: () => getContractDeliverable(contractId),
    enabled: Boolean(contractId),
  });
}

/** Cancel a live contract — re-opens its requirement for new proposals. */
export function useCancelContract() {
  return useMutation({
    mutationFn: ({
      contractId,
      payload,
    }: {
      contractId: string;
      payload?: CancelContractPayload;
    }) => cancelContract(contractId, payload),
  });
}

/** Mark a delivered, fully paid contract as completed. */
export function useCompleteContract() {
  return useMutation({
    mutationFn: completeContract,
  });
}
