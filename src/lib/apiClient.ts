import { createFetchError, ofetch } from "ofetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  /**
   * ofetch's default `FetchError.message` only reports the HTTP outcome
   * (`[POST] "…": 400 Bad Request`), while the API's error envelope carries
   * the human-readable reason (`{ success: false, message: "…" }`). This
   * promotes the envelope message so error toasts and `ErrorState` can say
   * *why* a call failed; the parsed body remains reachable on `.data` and
   * the other response getters are untouched. Non-envelope bodies (e.g. an
   * HTML proxy page) keep ofetch's default message.
   */
  onResponseError(context) {
    const error = createFetchError(context);
    const body = context.response?._data as { message?: unknown } | undefined;

    if (typeof body?.message === "string" && body.message) {
      error.message = body.message;
    }

    throw error;
  },
});

export default apiClient;
