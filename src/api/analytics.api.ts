import apiClient from "@/lib/apiClient";
import type {
  AdminAnalytics,
  ApiResponse,
  ClientAnalytics,
  ProfessionalAnalytics,
} from "@/types";

export function getClientAnalytics() {
  return apiClient<ApiResponse<ClientAnalytics>>("/analytics/client-analytics");
}

export function getProfessionalAnalytics() {
  return apiClient<ApiResponse<ProfessionalAnalytics>>(
    "/analytics/professional-analytics",
  );
}

export function getAdminAnalytics() {
  return apiClient<ApiResponse<AdminAnalytics>>("/analytics/admin-analytics");
}
