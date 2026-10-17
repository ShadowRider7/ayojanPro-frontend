"use client";

import {
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { type ApiFetchError, toastApiError } from "@/lib/apiClient";
import type { ApiResponse } from "@/types";

/**
 * Thin TanStack wrappers (plan T4) so every screen talks to the API the same
 * way:
 *
 * - queries/mutations always deal in the full `ApiResponse<T>` envelope
 *   (pagination `meta` stays available);
 * - mutation failures automatically surface the global error toast (unless
 *   the caller opts out by supplying its own `onError` that handles it — the
 *   toast still fires, `silent` suppresses it).
 */

/** Error type thrown by `apiClient`: typed 4xx/5xx, or a plain network error. */
export type ApiQueryError = ApiFetchError | Error;

type UseApiQueryOptions<T> = Omit<
  UseQueryOptions<ApiResponse<T>, ApiQueryError, ApiResponse<T>, QueryKey>,
  "queryKey" | "queryFn"
>;

export function useApiQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<ApiResponse<T>>,
  options?: UseApiQueryOptions<T>,
): UseQueryResult<ApiResponse<T>, ApiQueryError> {
  return useQuery<ApiResponse<T>, ApiQueryError, ApiResponse<T>, QueryKey>({
    queryKey,
    queryFn,
    ...options,
  });
}

type UseApiMutationOptions<TData, TVariables, TContext> = Omit<
  UseMutationOptions<ApiResponse<TData>, ApiQueryError, TVariables, TContext>,
  "mutationFn"
> & {
  /** Suppress the automatic error toast (e.g. the screen renders its own). */
  silent?: boolean;
};

export function useApiMutation<TData, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: UseApiMutationOptions<TData, TVariables, TContext>,
) {
  const { silent = false, onError, ...rest } = options ?? {};

  return useMutation<ApiResponse<TData>, ApiQueryError, TVariables, TContext>({
    ...rest,
    mutationFn,
    onError: (error, variables, context, mutation) => {
      onError?.(error, variables, context, mutation);
      if (!silent) {
        toastApiError(error);
      }
    },
  });
}
