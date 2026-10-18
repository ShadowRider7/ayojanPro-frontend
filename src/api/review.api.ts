import apiClient from "@/lib/apiClient";
import type { ApiResponse, CreateReviewPayload, Review } from "@/types";

/**
 * `POST /review/contracts/:id` — leave a rating on a completed contract
 * (either party; one review per side). A client's review also updates the
 * professional's public aggregate. Fails with 400 while the contract is not
 * `COMPLETED`, or when this side already reviewed it.
 */
export function createContractReview(
  contractId: string,
  payload: CreateReviewPayload,
) {
  return apiClient<ApiResponse<Review>>(`/review/contracts/${contractId}`, {
    method: "POST",
    body: payload,
  });
}
