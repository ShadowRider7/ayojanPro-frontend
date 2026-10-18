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

/**
 * `GET /professional/public/all-Professionals` — approved professionals with
 * their public profile (skills, services, portfolio and reviews). Supports
 * `searchTerm`, `professionalTitle`, pagination and sorting; the envelope
 * carries the pagination `meta`.
 */
export function getPublicProfessionals(query?: IQuery) {
  return apiClient<ApiResponse<PublicProfessional[]>>(
    "/professional/public/all-Professionals",
    { query },
  );
}

/**
 * `GET /professional/public/:professionalId` — a single approved
 * professional's public profile (skills, services, experience, portfolio and
 * reviews). Rejects with a 404 when the id is unknown or not approved.
 */
export function getPublicProfessional(professionalId: string) {
  return apiClient<ApiResponse<PublicProfessional>>(
    `/professional/public/${professionalId}`,
  );
}

/**
 * `POST /professional/apply-as-professional` — the application itself, as
 * multipart form data: the nested body travels in the `data` JSON field, the
 * resume as `resume` and supporting documents as repeated `additionalFiles`
 * entries. Creates the professional account in `PENDING` and emails the
 * applicant a 6-digit OTP (valid one hour).
 */
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

/**
 * `POST /professional/apply-as-professional/verify-email` — confirms the OTP
 * emailed at apply time. Unlike the client signup this issues no session; the
 * applicant sets a password via `/forgot-password` and logs in once an admin
 * approves the application.
 */
export function verifyProfessionalEmail(
  payload: VerifyProfessionalEmailPayload,
) {
  return apiClient<ApiResponse<ProfessionalApplication>>(
    "/professional/apply-as-professional/verify-email",
    { method: "POST", body: payload },
  );
}

/**
 * `PATCH /professional/update-my-profile` — edits the signed-in
 * professional's profile row (title, bio, contact details, experience years
 * and the `acceptingBookings` flag). Every field is optional; `null` clears a
 * text field. Returns the updated row.
 */
export function updateProfessionalProfile(
  payload: UpdateProfessionalProfilePayload,
) {
  return apiClient<ApiResponse<Professional>>(
    "/professional/update-my-profile",
    { method: "PATCH", body: payload },
  );
}

/**
 * `GET /professional/me/services` — own services with their contracts and
 * proposal items. Plain array, no pagination.
 */
export function getMyServices() {
  return apiClient<ApiResponse<ProfessionalService[]>>(
    "/professional/me/services",
  );
}

/** `POST /professional/service` — add one service to your profile. */
export function addService(payload: CreateProfessionalServicePayload) {
  return apiClient<ApiResponse<ProfessionalService>>("/professional/service", {
    method: "POST",
    body: payload,
  });
}

/** `PATCH /professional/service/:id` — partial edit of one service. */
export function updateService(
  serviceId: string,
  payload: UpdateProfessionalServicePayload,
) {
  return apiClient<ApiResponse<ProfessionalService>>(
    `/professional/service/${serviceId}`,
    { method: "PATCH", body: payload },
  );
}

/** `DELETE /professional/service/:id` — hard-deletes the service. */
export function deleteService(serviceId: string) {
  return apiClient<ApiResponse<null>>(`/professional/service/${serviceId}`, {
    method: "DELETE",
  });
}

/**
 * `POST /professional/skill` — creates a global `Skill` by name and links it
 * to you. `Skill.name` is unique platform-wide, so a duplicate name returns a
 * 409.
 */
export function addSkill(payload: CreateSkillPayload) {
  return apiClient<ApiResponse<Skill>>("/professional/skill", {
    method: "POST",
    body: payload,
  });
}

/** `DELETE /professional/skill/:id` — the id is the `Skill` id. */
export function deleteSkill(skillId: string) {
  return apiClient<ApiResponse<null>>(`/professional/skill/${skillId}`, {
    method: "DELETE",
  });
}

/** `POST /professional/experience` — add a work-history entry. */
export function addExperience(payload: CreateExperiencePayload) {
  return apiClient<ApiResponse<Experience>>("/professional/experience", {
    method: "POST",
    body: payload,
  });
}

/** `PATCH /professional/experience/:id` — partial edit of one entry. */
export function updateExperience(
  experienceId: string,
  payload: UpdateExperiencePayload,
) {
  return apiClient<ApiResponse<Experience>>(
    `/professional/experience/${experienceId}`,
    { method: "PATCH", body: payload },
  );
}

/** `DELETE /professional/experience/:id` — hard-deletes the entry. */
export function deleteExperience(experienceId: string) {
  return apiClient<ApiResponse<null>>(
    `/professional/experience/${experienceId}`,
    { method: "DELETE" },
  );
}

/**
 * `POST /professional/portfolio` — multipart: the metadata travels in the
 * `data` JSON field and the media as `mediaFile` (exactly one file).
 */
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

/** `GET /professional/me/portfolio` — own portfolio items (plain array). */
export function getMyPortfolioItems() {
  return apiClient<ApiResponse<PortfolioItem[]>>("/professional/me/portfolio");
}

/**
 * `PATCH /professional/portfolio/:id` — metadata only (plain JSON; the media
 * file cannot be replaced through this endpoint).
 */
export function updatePortfolioItem(
  portfolioId: string,
  payload: UpdatePortfolioItemPayload,
) {
  return apiClient<ApiResponse<PortfolioItem>>(
    `/professional/portfolio/${portfolioId}`,
    { method: "PATCH", body: payload },
  );
}

/** `DELETE /professional/portfolio/:id` — hard-deletes the item. */
export function deletePortfolioItem(portfolioId: string) {
  return apiClient<ApiResponse<null>>(
    `/professional/portfolio/${portfolioId}`,
    { method: "DELETE" },
  );
}
