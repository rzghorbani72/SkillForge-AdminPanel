'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isApiResponseError } from '@/lib/api-error';

const STALE_TIME_MS = 60_000;
const GARBAGE_COLLECT_MS = 5 * 60_000;
const MAX_RETRIES = 1;

/**
 * A 4xx is a verdict, not a hiccup. Retrying it fights the refresh-and-retry
 * and plan-gating logic that already lives in ApiClient.request().
 */
function isClientError(error: unknown): boolean {
  if (!isApiResponseError(error)) return false;
  const { status } = error.error;
  return status >= 400 && status < 500;
}

/**
 * The cache holds tenant-scoped data, so the QueryClient is created inside the
 * component tree — never at module scope, where a server render could share one
 * user's cache with the next request.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            gcTime: GARBAGE_COLLECT_MS,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => !isClientError(error) && failureCount < MAX_RETRIES,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
