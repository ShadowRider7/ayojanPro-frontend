import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  ApplyAsProfessionalPayload,
  IQuery,
  ProfessionalApplication,
  PublicProfessional,
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
