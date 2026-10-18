import apiClient from "@/lib/apiClient";
import type { ApiResponse, CreateReviewPayload, Review } from "@/types";

export function createContractReview(
  contractId: string,
  payload: CreateReviewPayload,
) {
  return apiClient<ApiResponse<Review>>(`/review/contracts/${contractId}`, {
    method: "POST",
    body: payload,
  });
}
