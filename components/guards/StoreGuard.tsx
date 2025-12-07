'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSchool } from '@/hooks/useSchool';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Building2 } from 'lucide-react';

interface SchoolGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SchoolGuard({ children, fallback }: SchoolGuardProps) {
  const { schools, isLoading, error } = useSchool();
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        setShowError(true);
      } else if (schools.length === 0) {
        // No schools found, redirect to schools page or show error
        setShowError(true);
      }
    }
  }, [isLoading, error, schools.length]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner message="Loading school access..." />
      </div>
    );
  }

  if (showError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-2xl font-bold text-destructive">
            School Access Required
          </h2>
          <p className="mb-4 text-muted-foreground">
            {error || 'You need access to a school to use this application.'}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.push('/schools')}>
              <Building2 className="mr-2 h-4 w-4" />
              Manage Schools
            </Button>
            <Button variant="outline" onClick={() => router.push('/login')}>
              Login Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
