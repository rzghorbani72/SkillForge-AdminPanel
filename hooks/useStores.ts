import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { Academy } from '@/types/api';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

interface UseStoresReturn {
  stores: Academy[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStores(): UseStoresReturn {
  const [stores, setStores] = useState<Academy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getAcademiesPublic();

      if (response.status === 200 && response.data) {
        let storesData: Academy[] = [];

        // Handle response structure - data is now directly available
        if (Array.isArray(response.data)) {
          storesData = response.data;
        } else if (response.data.status === 'ok' && response.data.data) {
          // Fallback for legacy response structure
          storesData = response.data.data;
        } else {
          logger.error('Academies', 'UnexpectedStoresResponse');
          setError('Invalid response structure from server');
          return;
        }

        setStores(storesData);
      } else {
        logger.error('Academies', 'UnexpectedStoresResponse');
        setError('Failed to fetch stores');
      }
    } catch (err) {
      logger.error('Academies', 'FetchingStoresFailed', errorFields(err));
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
    refetch: fetchStores,
  };
}
