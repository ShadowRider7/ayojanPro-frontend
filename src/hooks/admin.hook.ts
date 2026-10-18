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

/** `GET /admin/users` — all users with their profiles. */
export function useAdminUsers(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "users", query ?? {}],
    queryFn: () => getAdminUsers(query),
  });
}

/** `GET /admin/events` — all events. */
export function useAdminEvents(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "events", query ?? {}],
    queryFn: () => getAdminEvents(query),
  });
}

/** `GET /admin/contracts` — all contracts. */
export function useAdminContracts(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "contracts", query ?? {}],
    queryFn: () => getAdminContracts(query),
  });
}

/** `GET /admin/payments` — all payments. */
export function useAdminPayments(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "payments", query ?? {}],
    queryFn: () => getAdminPayments(query),
  });
}

/** `GET /professional/all-professionals` — admin professional list with full details. */
export function useAllProfessionals(query?: IQuery) {
  return useQuery({
    queryKey: ["admin", "professionals", query ?? {}],
    queryFn: () => getAllProfessionals(query),
  });
}

/** `PATCH /admin/users/:id/status` — activate, suspend or block a user. */
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

/** `POST /professional/approve-professional` — approve or reject an application. */
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
