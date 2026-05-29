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

export interface AcademyProfile {
  academy_id: number | null;
  role: string;
}

interface AuthUser {
  id: number;
  displayName: string;
  userDisplayName?: string | null;
  email: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
  lastLogin?: string | null;
  academyId?: number | null;
  currentAcademy?: { id?: number; name: string; domain?: string | null } | null;
  isAdminProfile?: boolean;
  platformLevel?: boolean;
  canManageAllAcademies?: boolean;
  canManagePlatform?: boolean;
  profiles: AcademyProfile[];
  profile?: {
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
    academy_id?: number | null;
    academyId?: number | null;
    [key: string]: unknown;
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

      const rawProfiles: AcademyProfile[] = (
        currentUser?.availableProfiles ??
        currentUser?.profiles ??
        []
      ).map((p: any) => ({
        academy_id: p.academy_id ?? null,
        role: (p.Role?.name ?? p.role?.name ?? p.role ?? '') as string
      }));

      setUser({
        id: (currentUser as any)?.id || 0,
        displayName: currentUser?.display_name ?? currentUser?.name ?? '',
        userDisplayName: currentUser?.user_display_name ?? null,
        email: currentUser?.email ?? '',
        phone: currentUser?.phone_number ?? '',
        role: role as 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT',
        lastLogin: currentUser?.last_login ?? null,
        academyId: academyId,
        currentAcademy: currentAcademy,
        isAdminProfile: isAdminProfile,
        platformLevel: platformLevel,
        canManageAllAcademies: canManageAllAcademies,
        canManagePlatform: canManagePlatform,
        profiles: rawProfiles,
        profile: {
          academy_id: academyId,
          academyId: academyId,
          academy: currentAcademy || null,
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
