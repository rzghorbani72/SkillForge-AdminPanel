'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { isDevelopmentMode, logDevInfo } from '@/lib/dev-utils';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  requireStaff?: boolean;
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const {
    redirectTo = '/dashboard',
    requireAuth = false,
    requireStaff = false
  } = options;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
          if (
            currentUser.currentProfile?.role?.name === 'ADMIN' ||
            currentUser.currentProfile?.role?.name === 'MANAGER' ||
            currentUser.currentProfile?.role?.name === 'TEACHER'
          ) {
            if (requireStaff) {
              // Staff user accessing staff page - allow access
              setIsLoading(false);
              return;
            }
            // Staff user - redirect to dashboard
            router.push(redirectTo);
            return;
          } else {
            // User has invalid role for this panel
            router.push('/unauthorized');
            return;
          }
        } else {
          // User is not authenticated
          if (requireAuth) {
            // Page requires authentication but user is not authenticated
            router.push('/login');
            return;
          }
        }

        // Default case - allow access
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);

        if (requireAuth) {
          // Page requires authentication but check failed
          router.push('/login');
          return;
        }

        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo, requireAuth, requireStaff]);

  return {
    isLoading,
    user,
    isAuthenticated: !!user,
    isStaff:
      user?.user?.role === 'ADMIN' ||
      user?.user?.role === 'MANAGER' ||
      user?.user?.role === 'TEACHER' ||
      false,
    isStudent: user?.user?.role === 'STUDENT' || false
  };
}
