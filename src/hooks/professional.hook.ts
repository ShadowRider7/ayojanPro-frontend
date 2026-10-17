import { useQuery } from "@tanstack/react-query";
import { getPublicProfessionals } from "@/api";
import type { IQuery } from "@/types";

/** Browse approved professionals (public listing). */
export function usePublicProfessionals(query?: IQuery) {
  return useQuery({
    queryKey: ["publicProfessionals", query ?? {}],
    queryFn: () => getPublicProfessionals(query),
  });
}
