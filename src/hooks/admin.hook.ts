import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveProfessional,
  getAdminContracts,
  getAdminEvents,
  getAdminPayments,
  getAdminRefunds,
  getAdminUsers,
  getAllProfessionals,
  settleRefund,
  updateUserStatus,
} from "@/api";
import type {
  ApproveProfessionalPayload,
  IQuery,
  SettleRefundPayload,
  UpdateUserStatusPayload,
} from "@/types";

export function useAdminUsers(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "users", query ?? {}],
    queryFn: () => getAdminUsers(query),
  });
}

export function useAdminEvents(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "events", query ?? {}],
    queryFn: () => getAdminEvents(query),
  });
}

export function useAdminContracts(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "contracts", query ?? {}],
    queryFn: () => getAdminContracts(query),
  });
}

export function useAdminPayments(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "payments", query ?? {}],
    queryFn: () => getAdminPayments(query),
  });
}

export function useAdminRefunds(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "refunds", query ?? {}],
    queryFn: () => getAdminRefunds(query),
  });
}

export function useSettleRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      refundId,
      payload,
    }: {
      refundId: string;
      payload: SettleRefundPayload;
    }) => settleRefund(refundId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useAllProfessionals(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "professionals", query ?? {}],
    queryFn: () => getAllProfessionals(query),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserStatusPayload;
    }) => updateUserStatus(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useApproveProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApproveProfessionalPayload) =>
      approveProfessional(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "professionals"] });
    },
  });
}
