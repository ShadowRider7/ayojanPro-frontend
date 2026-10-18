import { useQuery } from "@tanstack/react-query";
import {
  getAdminAnalytics,
  getClientAnalytics,
  getProfessionalAnalytics,
} from "@/api";

export function useClientAnalytics() {
  return useQuery({
    queryKey: ["analytics", "client"],
    queryFn: getClientAnalytics,
  });
}

export function useProfessionalAnalytics() {
  return useQuery({
    queryKey: ["analytics", "professional"],
    queryFn: getProfessionalAnalytics,
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["analytics", "admin"],
    queryFn: getAdminAnalytics,
  });
}
