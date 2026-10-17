import { useQuery } from "@tanstack/react-query";
import { getPublicProfessional, getPublicProfessionals } from "@/api";
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
