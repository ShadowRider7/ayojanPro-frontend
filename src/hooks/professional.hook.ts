import { useMutation, useQuery } from "@tanstack/react-query";
import {
  applyAsProfessional,
  getPublicProfessional,
  getPublicProfessionals,
  verifyProfessionalEmail,
} from "@/api";
import type { IQuery } from "@/types";

/** Browse approved professionals (public listing). */
export function usePublicProfessionals(query?: IQuery) {
  return useQuery({
    queryKey: ["publicProfessionals", query ?? {}],
    queryFn: () => getPublicProfessionals(query),
  });
}

/** A single approved professional's public profile. */
export function usePublicProfessional(professionalId: string) {
  return useQuery({
    queryKey: ["publicProfessional", professionalId],
    queryFn: () => getPublicProfessional(professionalId),
    enabled: Boolean(professionalId),
  });
}

/** Submit a professional application (multipart: `data` JSON + files). */
export function useApplyAsProfessional() {
  return useMutation({
    mutationFn: applyAsProfessional,
  });
}

/** Confirm the application email with the 6-digit OTP that was emailed. */
export function useVerifyProfessionalEmail() {
  return useMutation({
    mutationFn: verifyProfessionalEmail,
  });
}
