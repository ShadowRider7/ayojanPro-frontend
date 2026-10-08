import type { UserRole } from "@/types";

export { cn } from "cn";

export const dashboardRouteByRole: Record<UserRole, string> = {
  ADMIN: "/admin",
  PROFESSIONAL: "/professional",
  CLIENT: "/client",
};

export function dashboardPathForRole(role?: UserRole | null): string {
  return role ? dashboardRouteByRole[role] : "/login";
}

export function errorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const data = (error as { data?: unknown }).data;

    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.length > 0) {
        return message;
      }
    }

    if ("message" in error) {
      const message = (error as { message?: unknown }).message;
      if (
        typeof message === "string" &&
        message.length > 0 &&
        !message.startsWith("FetchError")
      ) {
        return message;
      }
    }
  }

  return fallback;
}
