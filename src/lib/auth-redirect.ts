import type { QueryClient } from "@tanstack/react-query";
import { getMe } from "@/api";
import { DASHBOARD_ROUTES } from "@/lib/constants";

const FALLBACK_DASHBOARD = "/dashboard";

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
