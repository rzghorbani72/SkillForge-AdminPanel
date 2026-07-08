'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';
import { LegalAdminWorkspace } from '@/components/legal/legal-admin-workspace';

export default function PlatformLegalPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthUser();
  const isPlatformAdmin =
    user?.role === 'ADMIN' && (user?.isAdminProfile || user?.platformLevel);

  useEffect(() => {
    if (isLoading) return;
    if (!isPlatformAdmin) {
      router.replace('/platform');
    }
  }, [isLoading, isPlatformAdmin, router]);

  if (isLoading || !isPlatformAdmin) {
    return null;
  }

  return (
    <div className="container max-w-6xl py-8">
      <LegalAdminWorkspace enabled={isPlatformAdmin} />
    </div>
  );
}
