import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveProfessional,
  getAdminContracts,
  getAdminEvents,
  getAdminPayments,
  getAdminUsers,
  getAllProfessionals,
  updateUserStatus,
} from "@/api";
import type { ApproveProfessionalPayload, IQuery } from "@/types";

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
      payload: { status: "ACTIVE" | "SUSPENDED" | "BLOCKED" };
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
