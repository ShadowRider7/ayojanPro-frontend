import apiClient from "@/lib/apiClient";
import type { ApiResponse, Client, UpdateClientProfilePayload } from "@/types";

export function updateClientProfile(payload: UpdateClientProfilePayload) {
  return apiClient<ApiResponse<Client>>("/client/my-profile", {
    method: "PATCH",
    body: payload,
  });
}
