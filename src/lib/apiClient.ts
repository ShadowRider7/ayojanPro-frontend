import { FetchError, type FetchOptions, ofetch } from "ofetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const REFRESH_PATH = "/auth/refresh-token";

const NO_REFRESH_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/google",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh-token",
  "/auth/logout",
]);

const rawClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
});

// biome-ignore lint/suspicious/noExplicitAny: mirrors ofetch's own default type parameter
type DefaultResponse = any;

let refreshInFlight: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = ofetch(REFRESH_PATH, {
      baseURL: BASE_URL,
      method: "POST",
      credentials: "include",
    })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function getStatus(error: unknown): number | undefined {
  if (!(error instanceof FetchError)) return undefined;
  return error.status ?? error.statusCode ?? error.response?.status;
}

async function request<T = DefaultResponse>(
  url: string,
  options: FetchOptions<"json"> = {},
  isRetry = false,
): Promise<T> {
  try {
    return await rawClient<T>(url, options);
  } catch (error) {
    const path = url.split("?")[0];
    const shouldRefresh =
      !isRetry && getStatus(error) === 401 && !NO_REFRESH_PATHS.has(path);

    if (shouldRefresh) {
      if (await refreshAccessToken()) {
        return request<T>(url, options, true);
      }
    }
    throw error;
  }
}

export default request;
