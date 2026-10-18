import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addExperience,
  addService,
  addSkill,
  applyAsProfessional,
  createPortfolioItem,
  deleteExperience,
  deletePortfolioItem,
  deleteService,
  deleteSkill,
  getMyPortfolioItems,
  getMyServices,
  getPublicProfessional,
  getPublicProfessionals,
  updateExperience,
  updatePortfolioItem,
  updateProfessionalProfile,
  updateService,
  verifyProfessionalEmail,
} from "@/api";
import type {
  IQuery,
  UpdateExperiencePayload,
  UpdatePortfolioItemPayload,
  UpdateProfessionalServicePayload,
} from "@/types";

function invalidatePublicProfile(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["publicProfessionals"] });
  queryClient.invalidateQueries({ queryKey: ["publicProfessional"] });
}

export function usePublicProfessionals(query?: IQuery) {
  return useQuery({
    queryKey: ["publicProfessionals", query ?? {}],
    queryFn: () => getPublicProfessionals(query),
  });
}

export function usePublicProfessional(professionalId: string) {
  return useQuery({
    queryKey: ["publicProfessional", professionalId],
    queryFn: () => getPublicProfessional(professionalId),
    enabled: Boolean(professionalId),
  });
}

export function useApplyAsProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyAsProfessional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useVerifyProfessionalEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyProfessionalEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useUpdateProfessionalProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfessionalProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useMyServices() {
  return useQuery({
    queryKey: ["professionalServices"],
    queryFn: getMyServices,
  });
}

export function useAddService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionalServices"] });
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      payload,
    }: {
      serviceId: string;
      payload: UpdateProfessionalServicePayload;
    }) => updateService(serviceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionalServices"] });
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionalServices"] });
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useAddSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSkill,
    onSuccess: () => {
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useAddExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExperience,
    onSuccess: () => {
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      experienceId,
      payload,
    }: {
      experienceId: string;
      payload: UpdateExperiencePayload;
    }) => updateExperience(experienceId, payload),
    onSuccess: () => {
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useMyPortfolio() {
  return useQuery({
    queryKey: ["professionalPortfolio"],
    queryFn: getMyPortfolioItems,
  });
}

export function useCreatePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPortfolioItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionalPortfolio"] });
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useUpdatePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      portfolioId,
      payload,
    }: {
      portfolioId: string;
      payload: UpdatePortfolioItemPayload;
    }) => updatePortfolioItem(portfolioId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionalPortfolio"] });
      invalidatePublicProfile(queryClient);
    },
  });
}

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePortfolioItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionalPortfolio"] });
      invalidatePublicProfile(queryClient);
    },
  });
}
