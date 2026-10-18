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

/**
 * Profile edits (title, bio, skills, experience, portfolio, services) all
 * change what the public endpoints return, so every mutation below
 * invalidates the public profile keys on top of its own.
 */
function invalidatePublicProfile(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["publicProfessionals"] });
  queryClient.invalidateQueries({ queryKey: ["publicProfessional"] });
}

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

/**
 * `PATCH /professional/update-my-profile`. Invalidates the session too —
 * the row is embedded in `GET /auth/me`, which the dashboard shell reads.
 */
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

/** Own services (`GET /professional/me/services`). */
export function useMyServices() {
  return useQuery({
    queryKey: ["professionalServices"],
    queryFn: getMyServices,
  });
}

/** Add / edit / remove one service. */
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

/**
 * Add / remove a skill. There is no "me" endpoint for skills — the list is
 * read from the public profile (2.2), so both mutations invalidate that key.
 */
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

/** Add / edit / remove a work-history entry (read from the public profile). */
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

/** Own portfolio items (`GET /professional/me/portfolio`). */
export function useMyPortfolio() {
  return useQuery({
    queryKey: ["professionalPortfolio"],
    queryFn: getMyPortfolioItems,
  });
}

/** Add (multipart) / edit (metadata) / remove one portfolio item. */
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
