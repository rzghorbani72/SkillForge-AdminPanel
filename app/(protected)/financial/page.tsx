'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useTranslation } from '@/lib/i18n/hooks';

// Pure redirect page — zero API calls here.
// MANAGER → /financial/store  (MANAGER-accessible endpoints)
// ADMIN   → /financial/platform (ADMIN-only endpoints)
// Others  → /dashboard
export default function FinancialPage() {
  const { user, isLoading } = useAuthUser();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoading) return;

    const role = user?.role?.toUpperCase();

    if (role === 'MANAGER' || role === 'TEACHER') {
      router.replace('/financial/academy');
    } else if (
      role === 'PLATFORM_OWNER' ||
      role === 'ADMIN' ||
      role === 'FINANCE'
    ) {
      router.replace('/financial/platform');
    } else {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  return <LoadingSpinner message={t('financial.store.overview.loading')} />;
}
