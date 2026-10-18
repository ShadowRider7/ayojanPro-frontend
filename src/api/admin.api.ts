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

/** `GET /admin/users` — all non-deleted users with their client/professional profiles. */
export function getAdminUsers(query?: IQuery) {
  return apiClient<ApiResponse<AdminUser[]>>("/admin/users", { query });
}

/** `GET /admin/events` — all non-deleted events with client and service requirements. */
export function getAdminEvents(query?: IQuery) {
  return apiClient<ApiResponse<AdminEvent[]>>("/admin/events", { query });
}

/** `GET /admin/contracts` — all contracts with full relations. */
export function getAdminContracts(query?: IQuery) {
  return apiClient<ApiResponse<Contract[]>>("/admin/contracts", { query });
}

/** `GET /admin/payments` — all payments with contract and client. */
export function getAdminPayments(query?: IQuery) {
  return apiClient<ApiResponse<Payment[]>>("/admin/payments", { query });
}

/** `PATCH /admin/users/:id/status` — activate, suspend or block a user. */
export function updateUserStatus(
  userId: string,
  payload: UpdateUserStatusPayload,
) {
  return apiClient<ApiResponse<User>>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: payload,
  });
}

/** `GET /professional/all-professionals` — admin list of all professionals with full details. */
export function getAllProfessionals(query?: IQuery) {
  return apiClient<ApiResponse<Professional[]>>(
    "/professional/all-professionals",
    {
      query,
    },
  );
}

/** `POST /professional/approve-professional` — approve or reject a professional application. */
export function approveProfessional(payload: ApproveProfessionalPayload) {
  return apiClient<ApiResponse<Professional>>(
    "/professional/approve-professional",
    {
      method: "POST",
      body: payload,
    },
  );
}
