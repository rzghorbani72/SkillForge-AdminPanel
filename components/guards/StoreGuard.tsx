'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Building2 } from 'lucide-react';

interface StoreGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function StoreGuard({ children, fallback }: StoreGuardProps) {
  const { stores, isLoading, error } = useStore();
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        setShowError(true);
      } else if (stores.length === 0) {
        // No stores found, redirect to stores page or show error
        setShowError(true);
      }
    }
  }, [isLoading, error, stores.length]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner message="Loading store access..." />
      </div>
    );
  }

  if (showError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-2xl font-bold text-destructive">
            Store Access Required
          </h2>
          <p className="mb-4 text-muted-foreground">
            {error || 'You need access to a store to use this application.'}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.push('/stores')}>
              <Building2 className="mr-2 h-4 w-4" />
              Manage Stores
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
