'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isPlatformAdmin } from '@/lib/roles';
import { useAuthUser } from '@/hooks/useAuthUser';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import PageContainer from '@/components/layout/page-container';

/** Legacy URL — platform staff management now lives under /platform/users. */
export default function AdminsRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthUser();

  useEffect(() => {
    if (isLoading) return;
    if (isPlatformAdmin(user) || user?.role === 'SUPPORT') {
      router.replace('/platform/users');
      return;
    }
    router.replace('/dashboard');
  }, [isLoading, user, router]);

  return (
    <PageContainer>
      <LoadingSpinner />
    </PageContainer>
  );
}
