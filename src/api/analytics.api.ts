import apiClient from "@/lib/apiClient";
import type {
  AdminAnalytics,
  ApiResponse,
  ClientAnalytics,
  ProfessionalAnalytics,
} from "@/types";

/**
 * `GET /analytics/client-analytics` — headline numbers for the signed-in
 * client's events, contracts, spending and reviews. CLIENT only; the backend
 * responds 404 when the account has no client profile.
 */
export function getClientAnalytics() {
  return apiClient<ApiResponse<ClientAnalytics>>("/analytics/client-analytics");
}

/** `GET /analytics/professional-analytics` — PROFESSIONAL only (approved). */
export function getProfessionalAnalytics() {
  return apiClient<ApiResponse<ProfessionalAnalytics>>(
    "/analytics/professional-analytics",
  );
}

/** `GET /analytics/admin-analytics` — platform-wide totals. ADMIN only. */
export function getAdminAnalytics() {
  return apiClient<ApiResponse<AdminAnalytics>>("/analytics/admin-analytics");
}
