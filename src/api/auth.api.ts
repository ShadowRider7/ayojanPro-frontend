import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  AuthTokens,
  ForgotPasswordPayload,
  GoogleAuthPayload,
  LoginPayload,
  RegistrationPayload,
  ResetPasswordPayload,
  UserProfile,
  VerifyAccountPayload,
  VerifyAccountResponse,
} from "@/types";

export function userRegistration(payload: RegistrationPayload) {
  return apiClient<ApiResponse<null>>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function verifyAccount(payload: VerifyAccountPayload) {
  return apiClient<ApiResponse<VerifyAccountResponse>>("/auth/verify-email", {
    method: "POST",
    body: payload,
  });
}

export function userLogin(payload: LoginPayload) {
  return apiClient<ApiResponse<AuthTokens>>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function googleOAuth(payload: GoogleAuthPayload) {
  return apiClient<ApiResponse<AuthTokens>>("/auth/google", {
    method: "POST",
    body: payload,
  });
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return apiClient<ApiResponse<null>>("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export function resetPassword(payload: ResetPasswordPayload) {
  return apiClient<ApiResponse<null>>("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

export function userLogout() {
  return apiClient<ApiResponse<null>>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiClient<ApiResponse<UserProfile>>("/auth/me");
}
