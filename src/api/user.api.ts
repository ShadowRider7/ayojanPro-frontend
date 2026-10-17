import apiClient from "@/lib/apiClient";
import type { ApiResponse, User } from "@/types";

export function updateProfileImage(profileImage: File) {
  const formData = new FormData();

  formData.append("profileImage", profileImage);

  return apiClient<ApiResponse<User>>("/user/profile-image", {
    method: "PATCH",
    body: formData,
  });
}
