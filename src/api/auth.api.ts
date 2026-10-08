import apiClient from "@/lib/apiClient";
import type {
  AuthUser,
  ForgotPasswordPayload,
  IApiResponse,
  LoginPayload,
  RegistrationPayload,
  ResetPasswordPayload,
  TokenPair,
  VerifyAccountPayload,
} from "@/types";

export function userLogin(
  payload: LoginPayload,
): Promise<IApiResponse<TokenPair>> {
  return apiClient("/auth/login", { method: "POST", body: payload });
}

export function verifyAccount(
  payload: VerifyAccountPayload,
): Promise<IApiResponse<TokenPair & { user: AuthUser }>> {
  return apiClient("/auth/verify-email", { method: "POST", body: payload });
}

export function userRegistration(
  payload: RegistrationPayload,
): Promise<IApiResponse<null>> {
  return apiClient("/auth/register", { method: "POST", body: payload });
}

export function userLogout() {
  return apiClient("/auth/logout", { method: "POST" });
}

export function getMe(): Promise<IApiResponse<AuthUser>> {
  return apiClient("/auth/me");
}

export function googleOAuth(payload: {
  idToken: string;
}): Promise<IApiResponse<TokenPair>> {
  return apiClient("/auth/google", { method: "POST", body: payload });
}

export function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<IApiResponse<null>> {
  return apiClient("/auth/forgot-password", { method: "POST", body: payload });
}

export function resetPassword(
  payload: ResetPasswordPayload,
): Promise<IApiResponse<null>> {
  return apiClient("/auth/reset-password", { method: "POST", body: payload });
}

export function refreshToken(): Promise<IApiResponse<TokenPair>> {
  return apiClient("/auth/refresh-token", { method: "POST" });
}
