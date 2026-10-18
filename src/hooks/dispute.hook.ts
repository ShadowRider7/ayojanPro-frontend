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

/** Raise a dispute against a contract (multipart: reason + description + evidence files). */
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

/** A single dispute (party or admin view). */
export function useDispute(disputeId: string) {
  return useQuery({
    queryKey: ["disputes", disputeId],
    queryFn: () => getDispute(disputeId),
    enabled: Boolean(disputeId),
  });
}

/** Admin list of all disputes. */
export function useDisputes(query?: IQuery) {
  return useQuery({
    queryKey: ["disputes", query ?? {}],
    queryFn: () => listDisputes(query),
  });
}

/** Admin-only dispute status transition. */
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

/** Admin resolves a dispute. */
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
