import apiClient from "@/lib/apiClient";
import type {
  AdminEvent,
  AdminUser,
  ApiResponse,
  ApproveProfessionalPayload,
  Contract,
  IQuery,
  Payment,
  Professional,
  UpdateUserStatusPayload,
  User,
} from "@/types";

export function getAdminUsers(query?: IQuery) {
  return apiClient<ApiResponse<AdminUser[]>>("/admin/users", { query });
}

export function getAdminEvents(query?: IQuery) {
  return apiClient<ApiResponse<AdminEvent[]>>("/admin/events", { query });
}

export function getAdminContracts(query?: IQuery) {
  return apiClient<ApiResponse<Contract[]>>("/admin/contracts", { query });
}

export function getAdminPayments(query?: IQuery) {
  return apiClient<ApiResponse<Payment[]>>("/admin/payments", { query });
}

export function updateUserStatus(
  userId: string,
  payload: UpdateUserStatusPayload,
) {
  return apiClient<ApiResponse<User>>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function getAllProfessionals(query?: IQuery) {
  return apiClient<ApiResponse<Professional[]>>(
    "/professional/all-professionals",
    {
      query,
    },
  );
}

export function approveProfessional(payload: ApproveProfessionalPayload) {
  return apiClient<ApiResponse<Professional>>(
    "/professional/approve-professional",
    {
      method: "POST",
      body: payload,
    },
  );
}
