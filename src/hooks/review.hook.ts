import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContractReview } from "@/api";
import type { CreateReviewPayload } from "@/types";

export function useCreateContractReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contractId,
      payload,
    }: {
      contractId: string;
      payload: CreateReviewPayload;
    }) => createContractReview(contractId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}
