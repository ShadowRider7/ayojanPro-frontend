import type { QueryClient } from "@tanstack/react-query";
import { getMe } from "@/api";
import { DASHBOARD_ROUTES } from "@/lib/constants";

/** Where a signed-in user is sent when their session cannot be read. */
const FALLBACK_DASHBOARD = "/dashboard";

/**
 * Refresh the cached session and resolve the signed-in user's landing page.
 *
 * `/auth/login` and `/auth/google` only return tokens — the role lives behind
 * `GET /auth/me` — so after a successful sign-in we drop the `["user"]` entry,
 * read it once (`retry: false`) and route by role. Falls back to the client
 * dashboard when the session read fails.
 */
export async function resolveSignedInPath(
  queryClient: QueryClient,
): Promise<string> {
  queryClient.invalidateQueries({ queryKey: ["user"] });

  try {
    const me = await queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: getMe,
      retry: false,
    });

    return DASHBOARD_ROUTES[me.data.role] ?? FALLBACK_DASHBOARD;
  } catch {
    return FALLBACK_DASHBOARD;
  }
}
