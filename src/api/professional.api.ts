import apiClient from "@/lib/apiClient";
import type {
  AuthUser,
  IApiResponse,
  ProfessionalApplicationPayload,
  VerifyAccountPayload,
} from "@/types";

export function applyAsProfessional(
  payload: ProfessionalApplicationPayload,
): Promise<IApiResponse<AuthUser>> {
  const formData = new FormData();

  formData.append("data", JSON.stringify(payload.data));
  formData.append("resume", payload.resume);

  for (const file of payload.additionalFiles) {
    formData.append("additionalFiles", file);
  }

  return apiClient("/professional/apply-as-professional", {
    method: "POST",
    body: formData,
  });
}

export function verifyProfessionalAccount(
  payload: VerifyAccountPayload,
): Promise<IApiResponse<AuthUser>> {
  return apiClient("/professional/apply-as-professional/verify-email", {
    method: "POST",
    body: payload,
  });
}
