'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { isPanelStaffRole } from '@/lib/roles';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  requireStaff?: boolean;
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { redirectTo = '/dashboard', requireAuth = false, requireStaff = false } = options;

  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          // User is authenticated
          if (requireAuth) {
            // Page requires authentication, user is authenticated - allow access
            setIsLoading(false);
            return;
          }

          // Page doesn't require authentication, but user is authenticated
          // Redirect based on user type
          const roleName =
            currentUser.currentProfile?.role?.name ??
            (currentUser as { role?: string }).role ??
            (currentUser.user as { role?: string } | undefined)?.role;
          if (isPanelStaffRole(roleName)) {
            if (requireStaff) {
              // Staff user accessing staff page - allow access
              setIsLoading(false);
              return;
            }
            // Staff user - redirect to target if not already there and not already redirected
            if (!hasRedirectedRef.current && pathname !== redirectTo) {
              hasRedirectedRef.current = true;
              router.replace(redirectTo);
              return;
            }
            setIsLoading(false);
            return;
          } else {
            // User has no panel role — deny, do not use /unauthorized
            if (!hasRedirectedRef.current && pathname !== '/login') {
              hasRedirectedRef.current = true;
              router.replace('/login');
              return;
            }
            setIsLoading(false);
            return;
          }
        } else {
          // User is not authenticated
          if (requireAuth) {
            // Page requires authentication but user is not authenticated
            if (!hasRedirectedRef.current && pathname !== '/login') {
              hasRedirectedRef.current = true;
              router.replace('/login');
              return;
            }
            setIsLoading(false);
            return;
          }
        }

        // Default case - allow access
        setIsLoading(false);
      } catch (error) {
        logger.error('Auth', 'CheckFailed', errorFields(error));

        if (requireAuth) {
          // Page requires authentication but check failed
          if (!hasRedirectedRef.current && pathname !== '/login') {
            hasRedirectedRef.current = true;
            router.replace('/login');
            return;
          }
        }

        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, redirectTo, requireAuth, requireStaff]);

  return {
    isLoading,
    user,
    isAuthenticated: !!user,
    isStaff: isPanelStaffRole(
      (user as { role?: string })?.role ??
        (user?.user as { role?: string } | undefined)?.role ??
        user?.currentProfile?.role?.name,
    ),
    isStudent: user?.user?.role === 'STUDENT' || false,
  };
}
