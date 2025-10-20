import useSWR from 'swr';

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

const fetcher = async (url: string, optionsJson?: string) => {
  const options: FetchOptions = optionsJson ? JSON.parse(optionsJson) : {};
  const { method = 'GET', headers = {}, body } = options;
  const response = await fetch(url, {
    method,
    headers: { ...defaultHeaders, ...headers },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = new Error(
      'An error occurred while fetching the data.'
    ) as Error & { info?: unknown; status?: number };
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export function useFetch<Data = unknown, Error = unknown>(
  url: string,
  options?: FetchOptions
) {
  const key = url ? [url, JSON.stringify(options || {})] : null;
  const { data, error, isLoading } = useSWR<Data, Error>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000
  });

  return {
    data,
    error,
    isLoading: isLoading && !error && !data
  };
}
