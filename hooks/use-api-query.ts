'use client';

import {
  keepPreviousData,
  useQuery,
  type QueryKey,
  type UseQueryOptions
} from '@tanstack/react-query';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';

interface ApiQueryOptions<T> {
  /** Built with `queryKeys.*` so the academy prefix can never be forgotten. */
  queryKey: QueryKey;
  /**
   * React Query aborts this signal when the component unmounts or the key
   * changes, so pass it straight to the apiClient method.
   */
  queryFn: (signal: AbortSignal) => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: UseQueryOptions<T, Error>['refetchInterval'];
  refetchOnWindowFocus?: boolean;
  /** Paginated lists: hold the previous page on screen instead of blanking. */
  keepPrevious?: boolean;
}

/**
 * The single entry point for reading data in the panel.
 *
 * It refuses to run before an academy is selected, which keeps a request from
 * being issued — and cached — without a tenant scope.
 */
export function useApiQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  keepPrevious = false,
  ...options
}: ApiQueryOptions<T>) {
  const academyId = useCurrentAcademyId();

  const query = useQuery<T>({
    queryKey,
    queryFn: ({ signal }) => queryFn(signal),
    enabled: enabled && academyId !== null,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    ...options
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isPending && query.fetchStatus !== 'idle',
    isFetching: query.isFetching,
    refresh: query.refetch
  };
}
