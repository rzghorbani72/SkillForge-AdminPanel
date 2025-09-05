import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface School {
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

interface UseSchoolsReturn {
  schools: School[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSchools(): UseSchoolsReturn {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getSchoolsPublic();

      if (response.status === 200 && response.data) {
        let schoolsData: School[] = [];

        // Handle different response structures
        if (response.data.status === 'ok' && response.data.data) {
          schoolsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          schoolsData = response.data;
        } else {
          console.error('Unexpected response structure:', response.data);
          setError('Invalid response structure from server');
          return;
        }

        setSchools(schoolsData);
      } else {
        console.error('Unexpected response:', response);
        setError('Failed to fetch schools');
      }
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schools');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return {
    schools,
    isLoading,
    error,
    refetch: fetchSchools
  };
}
