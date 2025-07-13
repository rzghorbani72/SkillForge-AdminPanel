'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AuthUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'USER';
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        
        if (!currentUser) {
          // No user logged in, redirect to login
          router.push(redirectTo);
          return;
        }

        setUser(currentUser);

        // Check if user should be redirected to school (students)
        if (authService.shouldRedirectToSchool(currentUser)) {
          const schools = await authService.getUserSchools();
          if (schools.length > 0) {
            const schoolUrl = authService.getSchoolDashboardUrl(schools[0].school);
            window.location.href = schoolUrl;
            return;
          }
        }

        // Check role-based access
        if (requiredRole) {
          const userRole = currentUser.profile.role?.name;
          const roleHierarchy = {
            'USER': 0,
            'TEACHER': 1,
            'MANAGER': 2,
            'ADMIN': 3
          };

          const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
          const requiredRoleLevel = roleHierarchy[requiredRole];

          if (userRoleLevel < requiredRoleLevel) {
            // User doesn't have sufficient permissions
            router.push('/unauthorized');
            return;
          }
        }

        // Check if user can access admin panel
        if (!authService.canAccessAdminPanel(currentUser)) {
          // User is a student, redirect to school
          const schools = await authService.getUserSchools();
          if (schools.length > 0) {
            const schoolUrl = authService.getSchoolDashboardUrl(schools[0].school);
            window.location.href = schoolUrl;
            return;
          } else {
            router.push('/unauthorized');
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
} 