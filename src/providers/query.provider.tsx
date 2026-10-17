"use client";

import {
  environmentManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { isApiFetchError } from "@/lib/apiClient";

/**
 * Reference repo (`PH-Healthcare-Nextjs`) keeps the query-client factory
 * inside this provider — we follow that instead of a `lib/queryClient.ts`.
 * T4 enhancement: sensible retry defaults on top of the reference's
 * `staleTime`.
 */

/** 4xx responses are caller errors — retrying them just hammers the API. */
function isRetriableError(error: unknown): boolean {
  if (isApiFetchError(error)) {
    return error.statusCode < 400 || error.statusCode >= 500;
  }
  // Unknown/network failures: let react-query retry a couple of times.
  return true;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) =>
          failureCount < 3 && isRetriableError(error),
      },
      mutations: {
        // Mutations are not idempotent — never auto-retry them.
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }

    return browserQueryClient;
  }
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
