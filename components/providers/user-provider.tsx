'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { clearLegacyAuthStorage } from '@/lib/clear-legacy-auth-storage';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

export interface AcademyProfile {
  academy_id: string | null;
  role: string;
}

export interface AuthUser {
  id: number;
  displayName: string;
  email: string;
  phone: string;
  role: 'PLATFORM_OWNER' | 'ADMIN' | 'FINANCE' | 'SUPPORT' | 'MANAGER' | 'TEACHER' | 'STUDENT';
  lastLogin?: string | null;
  avatarUrl?: string | null;
  academyId?: string | null;
  currentAcademy?: { id?: number; name: string; domain?: string | null } | null;
  isAdminProfile?: boolean;
  platformLevel?: boolean;
  canManageAllAcademies?: boolean;
  canManagePlatform?: boolean;
  /** "resource:action" grants from the roles/permissions engine (empty for PLATFORM_OWNER — it bypasses the grid). */
  granularPermissions: string[];
  /** True only for someone who signed up themselves (a MANAGER profile with no academy), never for an account a manager created. */
  isSelfRegisteredManager: boolean;
  /** True once the create-academy dialog has been shown, so it never opens a second time. */
  onboardingSeen: boolean;
  profiles: AcademyProfile[];
  profile?: {
    role?: 'PLATFORM_OWNER' | 'ADMIN' | 'FINANCE' | 'SUPPORT' | 'MANAGER' | 'TEACHER' | 'STUDENT';
    academy_id?: string | null;
    academyId?: string | null;
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

  const fetchUser = useCallback(
    async (isRetry = false) => {
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
          // A fresh login can land here before the session is fully visible
          // yet (the redirect that got us here fires the instant the login
          // response resolves). One short retry absorbs that race instead of
          // bouncing a just-logged-in user back to step 1 of the login form.
          if (!isRetry) {
            isFetchingRef.current = false;
            setTimeout(() => fetchUser(true), 500);
            return;
          }
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
          // Same race as the missing-user case above: give it one retry first.
          if (!isRetry) {
            isFetchingRef.current = false;
            setTimeout(() => fetchUser(true), 500);
            return;
          }
          router.replace('/login');
          return;
        }

        // Extract store information
        const academyId = currentUser?.academyId ?? currentUser?.academy_id ?? null;
        const currentAcademy = currentUser?.currentAcademy ?? null;

        const isAdminProfile = currentUser?.isAdminProfile ?? false;
        const platformLevel = currentUser?.platformLevel ?? false;
        const canManageAllAcademies =
          currentUser?.canManageAllAcademies ?? currentUser?.canManageAllStores ?? false;
        const canManagePlatform = currentUser?.canManagePlatform ?? false;
        const granularPermissions: string[] = currentUser?.granularPermissions ?? [];

        const rawProfiles: AcademyProfile[] = (
          currentUser?.availableProfiles ??
          currentUser?.profiles ??
          []
        ).map((p: any) => ({
          academy_id: p.academy_id ?? null,
          role: (p.Role?.name ?? p.role?.name ?? p.role ?? '') as string,
        }));

        setUser({
          id: (currentUser as any)?.id || 0,
          displayName: currentUser?.full_name ?? currentUser?.display_name ?? '',
          email: currentUser?.email ?? '',
          phone: currentUser?.phone_number ?? '',
          role: role as AuthUser['role'],
          lastLogin: currentUser?.last_login ?? null,
          avatarUrl: currentUser?.avatar?.url ?? null,
          academyId: academyId,
          currentAcademy: currentAcademy,
          isAdminProfile: isAdminProfile,
          platformLevel: platformLevel,
          canManageAllAcademies: canManageAllAcademies,
          canManagePlatform: canManagePlatform,
          granularPermissions: granularPermissions,
          // Defaulting both to the "nothing to show" side keeps an older API payload
          // from popping the onboarding dialog at someone who never signed up.
          isSelfRegisteredManager: currentUser?.isSelfRegisteredManager === true,
          onboardingSeen: currentUser?.onboardingSeen !== false,
          profiles: rawProfiles,
          profile: {
            academy_id: academyId,
            academyId: academyId,
            academy: currentAcademy || null,
            role: role as AuthUser['role'],
            isAdminProfile: isAdminProfile,
            platformLevel: platformLevel,
          },
        });
      } catch (err: any) {
        logger.error('Session', 'FetchingAuthenticatedUserFailed', errorFields(err));
        setError(err?.message || 'Failed to fetch user');

        // If unauthorized or token invalid, redirect to login (after one retry
        // for the same post-login race described above).
        if (err?.status === 401 || err?.response?.status === 401) {
          if (!isRetry) {
            isFetchingRef.current = false;
            setTimeout(() => fetchUser(true), 500);
            return;
          }
          router.replace('/login');
        }
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
        hasFetchedRef.current = true;
      }
    },
    [router],
  );

  useEffect(() => {
    clearLegacyAuthStorage();
    if (!hasFetchedRef.current) {
      fetchUser();
    }
  }, [fetchUser]);

  const value: UserContextValue = {
    user,
    isLoading,
    error,
    refetch: fetchUser,
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
