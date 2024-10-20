import useSWR from 'swr';

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

const fetcher = async (url: string, options: FetchOptions = {}) => {
  const { method = 'GET', headers = {}, body } = options;
  const response = await fetch(url, {
    method,
    headers: { ...defaultHeaders, ...headers },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export function useFetch<Data = any, Error = any>(
  url: string,
  options?: FetchOptions
) {
  const { data, error, isLoading } = useSWR<Data, Error>(
    url ? [url, options] : null,
    fetcher
  );

  return {
    data,
    error,
    isLoading: isLoading && !error && !data
  };
}
