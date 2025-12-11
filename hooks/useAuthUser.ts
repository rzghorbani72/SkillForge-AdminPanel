'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface AuthUser {
  id: number;
  role: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
  storeId?: number | null; // Store ID from /me endpoint (top level)
  profile?: {
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
    store_id?: number | null;
    storeId?: number | null;
    store?: {
      id: number;
      name?: string;
      [key: string]: any;
    };
    [key: string]: any;
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
      const userData = (await apiClient.getCurrentUser()) as any;
      const currentUser = userData?.data as any;

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

      // Extract store information
      // API returns: storeId (can be null for admins), currentStore (can be null)
      const storeId = currentUser?.storeId ?? currentUser?.store_id ?? null;
      const currentStore = currentUser?.currentStore ?? null;

      setUser({
        id: (currentUser as any)?.id || 0,
        role: role as 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT',
        storeId: storeId, // Store at top level for easy access
        profile: {
          ...((currentUser as any)?.profile || {}),
          store_id: storeId, // Can be null for admins
          storeId: storeId, // Can be null for admins
          store: currentStore || (currentUser as any)?.profile?.store || null,
          role: role as 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT'
        }
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
