'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface AuthUser {
  id: number;
  role: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
  academyId?: number | null;
  currentAcademy?: Record<string, unknown> | null;
  isAdminProfile?: boolean;
  platformLevel?: boolean;
  canManageAllStores?: boolean;
  canManageAllAcademies?: boolean;
  canManagePlatform?: boolean;
  profile?: {
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
    academy_id?: number | null;
    academyId?: number | null;
    store?: {
      id: number;
      name?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

interface UserContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchUser = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
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
      const academyId =
        currentUser?.academyId ?? currentUser?.academy_id ?? null;
      const currentAcademy = currentUser?.currentAcademy ?? null;

      const isAdminProfile = currentUser?.isAdminProfile ?? false;
      const platformLevel = currentUser?.platformLevel ?? false;
      const canManageAllAcademies =
        currentUser?.canManageAllAcademies ??
        currentUser?.canManageAllStores ??
        false;
      const canManagePlatform = currentUser?.canManagePlatform ?? false;

      setUser({
        id: (currentUser as any)?.id || 0,
        role: role as 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT',
        academyId: academyId,
        currentAcademy: currentAcademy,
        isAdminProfile: isAdminProfile,
        platformLevel: platformLevel,
        canManageAllAcademies: canManageAllAcademies,
        canManagePlatform: canManagePlatform,
        profile: {
          ...((currentUser as any)?.profile || {}),
          academy_id: academyId,
          academyId: academyId,
          academy:
            currentAcademy ||
            (currentUser as any)?.profile?.academy ||
            (currentUser as any)?.profile?.store ||
            null,
          role: role as 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT',
          isAdminProfile: isAdminProfile,
          platformLevel: platformLevel
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
      isFetchingRef.current = false;
      hasFetchedRef.current = true;
    }
  }, [router]);

  // Fetch user only once on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchUser();
    }
  }, [fetchUser]);

  const value: UserContextValue = {
    user,
    isLoading,
    error,
    refetch: fetchUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useAuthUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useAuthUser must be used within a UserProvider');
  }
  return context;
}
