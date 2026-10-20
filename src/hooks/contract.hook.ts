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

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });
}

export function useContract(contractId: string) {
  return useQuery({
    queryKey: ["contracts", contractId],
    queryFn: () => getContract(contractId),
    enabled: Boolean(contractId),
  });
}

export function useContractDeliverable(contractId: string) {
  return useQuery({
    queryKey: ["contracts", contractId, "deliverable"],
    queryFn: () => getContractDeliverable(contractId),
    enabled: Boolean(contractId),
  });
}

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

export function useCancelContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contractId,
      payload,
    }: {
      contractId: string;
      payload?: CancelContractPayload;
    }) => cancelContract(contractId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Cancelling a contract also moves the proposal behind it.
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

export function useCompleteContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
