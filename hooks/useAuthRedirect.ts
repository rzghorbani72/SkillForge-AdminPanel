'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { isDevelopmentMode, logDevInfo } from '@/lib/dev-utils';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  requireStaff?: boolean;
  requireStudent?: boolean;
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const {
    redirectTo = '/dashboard',
    requireAuth = false,
    requireStaff = false,
    requireStudent = false
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
            currentUser.user?.role === 'ADMIN' ||
            currentUser.user?.role === 'MANAGER' ||
            currentUser.user?.role === 'TEACHER'
          ) {
            if (requireStaff) {
              // Staff user accessing staff page - allow access
              setIsLoading(false);
              return;
            }
            // Staff user - redirect to dashboard
            router.push(redirectTo);
            return;
          } else if (currentUser.user?.role === 'STUDENT') {
            if (requireStudent) {
              // Student user accessing student page - allow access
              setIsLoading(false);
              return;
            }
            // Student user - redirect to their school (simplified for now)
            if (isDevelopmentMode()) {
              // In development, show a message instead of redirecting to external domain
              logDevInfo(
                'Development mode: Student user would be redirected to school dashboard'
              );
              setIsLoading(false);
              return;
            } else {
              // In production, redirect to school
              window.location.href = '/student-dashboard';
              return;
            }
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
  }, [router, redirectTo, requireAuth, requireStaff, requireStudent]);

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
