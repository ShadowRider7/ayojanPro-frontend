import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  attachDeliverable,
  cancelContract,
  completeContract,
  getContract,
  getContractDeliverable,
  getContracts,
} from "@/api";
import type { AttachDeliverablePayload, CancelContractPayload } from "@/types";

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

/**
 * Submit (or replace) the professional's deliverable. The upsert also flips
 * the contract to `DELIVERED`, which decides what the client can do next, so
 * success refreshes the contract and event trees together.
 */
export function useAttachDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      payload,
    }: {
      contractId: string;
      payload: AttachDeliverablePayload;
    }) => attachDeliverable(contractId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
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
