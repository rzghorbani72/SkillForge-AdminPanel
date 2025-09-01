'use client';

import { ReactNode } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireStaff?: boolean;
  requireStudent?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireStaff = false,
  requireStudent = false,
  redirectTo = '/login',
  fallback
}: AuthGuardProps) {
  const { isLoading, isAuthenticated, isStaff, isStudent } = useAuthRedirect({
    redirectTo,
    requireAuth,
    requireStaff,
    requireStudent
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user meets requirements
  if (requireAuth && !isAuthenticated) {
    return fallback || null;
  }

  if (requireStaff && !isStaff) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Access Denied
            </h2>
            <p className="mt-2 text-gray-600">
              This page is for staff members only.
            </p>
          </div>
        </div>
      )
    );
  }

  if (requireStudent && !isStudent) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Access Denied
            </h2>
            <p className="mt-2 text-gray-600">
              This page is for students only.
            </p>
          </div>
        </div>
      )
    );
  }

  // User meets all requirements, render children
  return <>{children}</>;
}
