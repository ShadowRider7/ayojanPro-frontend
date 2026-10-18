import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  ApplyAsProfessionalPayload,
  CreateExperiencePayload,
  CreatePortfolioItemPayload,
  CreateProfessionalServicePayload,
  CreateSkillPayload,
  Experience,
  IQuery,
  PortfolioItem,
  Professional,
  ProfessionalApplication,
  ProfessionalService,
  PublicProfessional,
  Skill,
  UpdateExperiencePayload,
  UpdatePortfolioItemPayload,
  UpdateProfessionalProfilePayload,
  UpdateProfessionalServicePayload,
  VerifyProfessionalEmailPayload,
} from "@/types";

export function getPublicProfessionals(query?: IQuery) {
  return apiClient<ApiResponse<PublicProfessional[]>>(
    "/professional/public/all-Professionals",
    { query },
  );
}

export function getPublicProfessional(professionalId: string) {
  return apiClient<ApiResponse<PublicProfessional>>(
    `/professional/public/${professionalId}`,
  );
}

export function applyAsProfessional({
  payload,
  resume,
  additionalFiles,
}: {
  payload: ApplyAsProfessionalPayload;
  resume: File;
  additionalFiles: File[];
}) {
  const body = new FormData();

  body.append("data", JSON.stringify(payload));
  body.append("resume", resume);
  for (const file of additionalFiles) {
    body.append("additionalFiles", file);
  }

  return apiClient<ApiResponse<ProfessionalApplication>>(
    "/professional/apply-as-professional",
    { method: "POST", body },
  );
}

export function verifyProfessionalEmail(
  payload: VerifyProfessionalEmailPayload,
) {
  return apiClient<ApiResponse<ProfessionalApplication>>(
    "/professional/apply-as-professional/verify-email",
    { method: "POST", body: payload },
  );
}

export function updateProfessionalProfile(
  payload: UpdateProfessionalProfilePayload,
) {
  return apiClient<ApiResponse<Professional>>(
    "/professional/update-my-profile",
    { method: "PATCH", body: payload },
  );
}

export function getMyServices() {
  return apiClient<ApiResponse<ProfessionalService[]>>(
    "/professional/me/services",
  );
}

export function addService(payload: CreateProfessionalServicePayload) {
  return apiClient<ApiResponse<ProfessionalService>>("/professional/service", {
    method: "POST",
    body: payload,
  });
}

export function updateService(
  serviceId: string,
  payload: UpdateProfessionalServicePayload,
) {
  return apiClient<ApiResponse<ProfessionalService>>(
    `/professional/service/${serviceId}`,
    { method: "PATCH", body: payload },
  );
}

export function deleteService(serviceId: string) {
  return apiClient<ApiResponse<null>>(`/professional/service/${serviceId}`, {
    method: "DELETE",
  });
}

export function addSkill(payload: CreateSkillPayload) {
  return apiClient<ApiResponse<Skill>>("/professional/skill", {
    method: "POST",
    body: payload,
  });
}

export function deleteSkill(skillId: string) {
  return apiClient<ApiResponse<null>>(`/professional/skill/${skillId}`, {
    method: "DELETE",
  });
}

export function addExperience(payload: CreateExperiencePayload) {
  return apiClient<ApiResponse<Experience>>("/professional/experience", {
    method: "POST",
    body: payload,
  });
}

export function updateExperience(
  experienceId: string,
  payload: UpdateExperiencePayload,
) {
  return apiClient<ApiResponse<Experience>>(
    `/professional/experience/${experienceId}`,
    { method: "PATCH", body: payload },
  );
}

export function deleteExperience(experienceId: string) {
  return apiClient<ApiResponse<null>>(
    `/professional/experience/${experienceId}`,
    { method: "DELETE" },
  );
}

export function createPortfolioItem({
  payload,
  mediaFile,
}: {
  payload: CreatePortfolioItemPayload;
  mediaFile: File;
}) {
  const body = new FormData();

  body.append("data", JSON.stringify(payload));
  body.append("mediaFile", mediaFile);

  return apiClient<ApiResponse<PortfolioItem>>("/professional/portfolio", {
    method: "POST",
    body,
  });
}

export function getMyPortfolioItems() {
  return apiClient<ApiResponse<PortfolioItem[]>>("/professional/me/portfolio");
}

export function updatePortfolioItem(
  portfolioId: string,
  payload: UpdatePortfolioItemPayload,
) {
  return apiClient<ApiResponse<PortfolioItem>>(
    `/professional/portfolio/${portfolioId}`,
    { method: "PATCH", body: payload },
  );
}

export function deletePortfolioItem(portfolioId: string) {
  return apiClient<ApiResponse<null>>(
    `/professional/portfolio/${portfolioId}`,
    { method: "DELETE" },
  );
}
