'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface AuthUser {
  id: number;
  role: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
  profile?: {
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
  };
}

/**
 * Hook to fetch authenticated user from API using JWT cookie
 * Automatically redirects to login if user is not authenticated
 */
export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API endpoint which will use JWT cookie from headers
      const currentUser = (await apiClient.getCurrentUser())?.data as any;

      if (!currentUser) {
        // No user found, redirect to login
        router.replace('/login');
        return;
      }

      // Extract role from user data (API returns role directly)
      const role =
        currentUser?.role ||
        currentUser?.profile?.role?.name ||
        currentUser?.profile?.role_name ||
        currentUser?.profile?.role ||
        null;

      if (!role) {
        // No role found, redirect to login
        router.replace('/login');
        return;
      }

      setUser({
        id: (currentUser as any)?.id || 0,
        role: role as 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT',
        profile: (currentUser as any)?.profile || currentUser
      });
    } catch (err: any) {
      console.error('Error fetching authenticated user:', err);
      setError(err?.message || 'Failed to fetch user');

      // If unauthorized or token invalid, redirect to login
      if (err?.status === 401 || err?.response?.status === 401) {
        router.replace('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser
  };
}
