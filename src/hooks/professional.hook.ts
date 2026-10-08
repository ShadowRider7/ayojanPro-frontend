import { useMutation } from "@tanstack/react-query";
import { applyAsProfessional, verifyProfessionalAccount } from "@/api";

export function useApplyAsProfessional() {
  return useMutation({
    mutationFn: applyAsProfessional,
  });
}

export function useVerifyProfessionalAccount() {
  return useMutation({
    mutationFn: verifyProfessionalAccount,
  });
}
