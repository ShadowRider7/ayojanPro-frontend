import apiClient from "@/lib/apiClient";
import type { ApiResponse, Client, UpdateClientProfilePayload } from "@/types";

/** `PATCH /client/my-profile` — update the signed-in client's own profile. */
export function updateClientProfile(payload: UpdateClientProfilePayload) {
  return apiClient<ApiResponse<Client>>("/client/my-profile", {
    method: "PATCH",
    body: payload,
  });
}
