import apiClient from "@/lib/apiClient";
import type { ApiResponse, IQuery, PublicProfessional } from "@/types";

/**
 * `GET /professional/public/all-Professionals` — approved professionals with
 * their public profile (skills, services, portfolio and reviews). Supports
 * `searchTerm`, `professionalTitle`, pagination and sorting; the envelope
 * carries the pagination `meta`.
 */
export function getPublicProfessionals(query?: IQuery) {
  return apiClient<ApiResponse<PublicProfessional[]>>(
    "/professional/public/all-Professionals",
    { query },
  );
}
