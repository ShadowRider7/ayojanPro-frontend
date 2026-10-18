import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDispute,
  listDisputes,
  raiseDispute,
  resolveDispute,
  updateDisputeStatus,
} from "@/api";
import type {
  IQuery,
  RaiseDisputePayload,
  ResolveDisputePayload,
  UpdateDisputeStatusPayload,
} from "@/types";

export function useRaiseDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      payload,
      evidence,
    }: {
      contractId: string;
      payload: RaiseDisputePayload;
      evidence: File[];
    }) => raiseDispute(contractId, { ...payload, evidence }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
}

export function useDispute(disputeId: string) {
  return useQuery({
    queryKey: ["disputes", disputeId],
    queryFn: () => getDispute(disputeId),
    enabled: Boolean(disputeId),
  });
}

export function useDisputes(query?: IQuery) {
  return useQuery({
    queryKey: ["disputes", query ?? {}],
    queryFn: () => listDisputes(query),
  });
}

export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      disputeId,
      payload,
    }: {
      disputeId: string;
      payload: UpdateDisputeStatusPayload;
    }) => updateDisputeStatus(disputeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      disputeId,
      payload,
    }: {
      disputeId: string;
      payload: ResolveDisputePayload;
    }) => resolveDispute(disputeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
}
