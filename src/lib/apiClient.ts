import { createFetchError, ofetch } from "ofetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",

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
