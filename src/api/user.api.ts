import apiClient from "@/lib/apiClient";
import type { AuthUser, IApiResponse } from "@/types";

export function uploadProfileImage(
  profileImage: File,
): Promise<IApiResponse<AuthUser>> {
  const formData = new FormData();
  formData.append("profileImage", profileImage);

  return apiClient("/user/profile-image", {
    method: "PATCH",
    body: formData,
  });
}
