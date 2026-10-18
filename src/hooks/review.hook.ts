import { useMutation } from "@tanstack/react-query";
import { createContractReview } from "@/api";
import type { CreateReviewPayload } from "@/types";

/** Leave a rating on a completed contract (one review per side). */
export function useCreateContractReview() {
  return useMutation({
    mutationFn: ({
      contractId,
      payload,
    }: {
      contractId: string;
      payload: CreateReviewPayload;
    }) => createContractReview(contractId, payload),
  });
}
