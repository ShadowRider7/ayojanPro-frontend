/**
 * API client (plan T4). Follows the reference repo's convention
 * (`PH-Healthcare-Nextjs` → `src/lib/apiClient.ts`): a single default-exported
 * `ofetch` instance that domain api fns import as
 * `import apiClient from "@/lib/apiClient"`.
 *
 * Deliberate enhancements over the reference (plan T4):
 * - `credentials: "include"` so the httpOnly auth cookies flow with every
 *   request (cookies are never read from JS — see plan §0).
 * - Responses use the backend envelope (`ApiResponse<T>`); failures are thrown
 *   as a typed `ApiFetchError`, never a bare `FetchError`.
 * - A 401 triggers one `POST /auth/refresh-token` + retry of the original
 *   request. The refresh call itself bypasses this logic (and is
 *   single-flight), so it can never recurse.
 * - Global API-error → toast mapping (`toastApiError`) lives here so the
 *   query/mutation wrappers in `src/hooks/api.hook.ts` can reuse it.
 */

import type { FetchOptions } from "ofetch";
import { ofetch } from "ofetch";
import { toast } from "@/components/ui/toast";
import type { ApiError, ApiErrorDetail, ApiResponse } from "@/types";
import { humanize } from "@/utils";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

/** Options accepted by every request, plus our own flags. */
export interface ApiClientOptions extends FetchOptions<"json"> {
  /**
   * Skip the automatic 401 → refresh-token → retry-once dance. Useful for
   * calls that legitimately expect a 401 (e.g. `GET /auth/me` while logged
   * out) so we don't burn a pointless refresh round-trip.
   */
  skipAuthRefresh?: boolean;
}

/** Typed API failure carrying the backend error envelope. */
export class ApiFetchError extends Error {
  /** HTTP status code from the envelope, e.g. `404`. */
  readonly statusCode: number;
  /** HTTP status text from the envelope, e.g. `Not Found`. */
  readonly statusText: string;
  /** Extra debugging detail the backend only sends in development. */
  readonly details?: ApiErrorDetail;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiFetchError";
    this.statusCode = error.statusCode;
    this.statusText = error.name;
    this.details = error.error;
  }
}

export function isApiFetchError(error: unknown): error is ApiFetchError {
  return error instanceof ApiFetchError;
}

/** Narrow an unknown response body to the backend error envelope. */
function toApiErrorEnvelope(data: unknown): ApiError | undefined {
  if (typeof data !== "object" || data === null) {
    return undefined;
  }
  const candidate = data as Partial<ApiError>;
  if (
    candidate.success === false &&
    typeof candidate.statusCode === "number" &&
    typeof candidate.message === "string"
  ) {
    return data as ApiError;
  }
  return undefined;
}

/**
 * The low-level client. It only builds URLs and parses envelopes — the 401
 * refresh logic lives in {@link apiClient}.
 */
const rawClient = ofetch.create({
  baseURL: API_BASE_URL,
  credentials: "include",
  // Retry policy lives in the query layer (src/providers/query.provider.tsx);
  // only the 401 refresh dance is handled here.
  retry: 0,
  onResponseError: ({ response }) => {
    const envelope = toApiErrorEnvelope(response._data);
    if (envelope) {
      throw new ApiFetchError(envelope);
    }
    // Non-envelope failure (proxy, 502 HTML page, …) — still surface a typed
    // error so callers never have to guess.
    throw new ApiFetchError({
      success: false,
      statusCode: response.status,
      name: "Request Failed",
      message: `Request failed with status ${response.status}`,
    });
  },
  onRequestError: ({ error }) => {
    // Network/CORS/DNS failure — `response` is undefined.
    throw new Error(
      `Could not reach the AyojanPro API (${API_BASE_URL}): ${error.message}`,
    );
  },
});

let refreshRequest: Promise<unknown> | null = null;

/** Single-flight session refresh: concurrent 401s share one refresh call. */
function refreshSession(): Promise<unknown> {
  if (!refreshRequest) {
    refreshRequest = rawClient("/auth/refresh-token", { method: "POST" });
    refreshRequest.finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
}

/**
 * Perform a GET/POST/PATCH/… against the API and return the full success
 * envelope (`{ success, statusCode, message, data, meta? }`) so pagination
 * `meta` stays available to callers.
 *
 * @example
 * const res = await apiClient<Event[]>("/event/my-events");
 */
async function apiClient<T>(
  request: string,
  options: ApiClientOptions = {},
): Promise<ApiResponse<T>> {
  const { skipAuthRefresh = false, ...fetchOptions } = options;
  try {
    return await rawClient<ApiResponse<T>>(request, fetchOptions);
  } catch (error) {
    const unauthorized =
      error instanceof ApiFetchError && error.statusCode === 401;
    if (unauthorized && !skipAuthRefresh) {
      // If the refresh itself fails its `ApiFetchError` propagates — the
      // session is simply gone and the caller sees a plain 401-class error.
      await refreshSession();
      return await rawClient<ApiResponse<T>>(request, fetchOptions);
    }
    throw error;
  }
}

/** Unwrap an envelope to just its `data` payload. */
export function unwrapData<T>(response: ApiResponse<T>): T {
  return response.data;
}

/**
 * Best-effort human message for anything thrown by the API layer.
 * Backend `message` strings are already user-oriented; network failures get a
 * generic fallback.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiFetchError) {
    return (
      error.message ||
      (error.statusText ? humanize(error.statusText) : "Request failed.")
    );
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

/** Short heading for a failed request, e.g. `Not Found`. */
function getApiErrorTitle(error: unknown): string {
  if (error instanceof ApiFetchError && error.statusCode >= 400) {
    return error.statusText ? humanize(error.statusText) : "Request failed";
  }
  return "Request failed";
}

/** Global "request failed" toast used by the query/mutation wrappers. */
export function toastApiError(error: unknown): void {
  toast.add({
    type: "error",
    title: getApiErrorTitle(error),
    description: getApiErrorMessage(error),
  });
}

export default apiClient;
