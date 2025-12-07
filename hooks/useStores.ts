import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface Store {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  private_domain?: string;
  public_address?: string;
  private_address?: string;
  images?: Array<{
    id: number;
    filename: string;
  }>;
}

interface UseStoresReturn {
  stores: Store[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStores(): UseStoresReturn {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getStoresPublic();

      if (response.status === 200 && response.data) {
        let storesData: Store[] = [];

        // Handle response structure - data is now directly available
        if (Array.isArray(response.data)) {
          storesData = response.data;
        } else if (response.data.status === 'ok' && response.data.data) {
          // Fallback for legacy response structure
          storesData = response.data.data;
        } else {
          console.error('Unexpected response structure:', response.data);
          setError('Invalid response structure from server');
          return;
        }

        setStores(storesData);
      } else {
        console.error('Unexpected response:', response);
        setError('Failed to fetch stores');
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return {
    stores,
    isLoading,
    error,
    refetch: fetchStores
  };
}
