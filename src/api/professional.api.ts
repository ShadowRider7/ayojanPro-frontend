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

/**
 * `GET /professional/public/:professionalId` — a single approved
 * professional's public profile (skills, services, experience, portfolio and
 * reviews). Rejects with a 404 when the id is unknown or not approved.
 */
export function getPublicProfessional(professionalId: string) {
  return apiClient<ApiResponse<PublicProfessional>>(
    `/professional/public/${professionalId}`,
  );
}
