'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enhancedAuthService } from '@/lib/enhanced-auth';
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
        const currentUser = await enhancedAuthService.getCurrentUser();
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
          if (currentUser.isStaff && requireStaff) {
            // Staff user accessing staff page - allow access
            setIsLoading(false);
            return;
          }

          if (currentUser.isStudent && requireStudent) {
            // Student user accessing student page - allow access
            setIsLoading(false);
            return;
          }

          // User is authenticated but accessing wrong type of page
          if (currentUser.isStaff) {
            // Staff user - redirect to dashboard
            router.push(redirectTo);
            return;
          } else if (currentUser.isStudent) {
            // Student user - redirect to their school
            const schools = await enhancedAuthService.getUserSchools();
            if (schools.length > 0) {
              const schoolUrl = enhancedAuthService.getSchoolDashboardUrl(
                schools[0]
              );

              if (isDevelopmentMode()) {
                // In development, show a message instead of redirecting to external domain
                logDevInfo(
                  'Development mode: Would redirect student to:',
                  schoolUrl
                );
                // For development, we'll stay on the current page and show a message
                // You can customize this behavior as needed
                setIsLoading(false);
                return;
              } else {
                // In production, redirect to school
                window.location.href = schoolUrl;
                return;
              }
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
    isStaff: user?.isStaff || false,
    isStudent: user?.isStudent || false
  };
}
