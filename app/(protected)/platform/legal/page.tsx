'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformAdmin } from '@/lib/roles';
import { LegalAdminWorkspace } from '@/components/legal/legal-admin-workspace';

export default function PlatformLegalPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthUser();
  const isPlatformAdminUser = isPlatformAdmin(user);

  useEffect(() => {
    if (isLoading) return;
    if (!isPlatformAdminUser) {
      router.replace('/platform');
    }
  }, [isLoading, isPlatformAdminUser, router]);

  if (isLoading || !isPlatformAdminUser) {
    return null;
  }

  return (
    <div className="container max-w-6xl py-8">
      <LegalAdminWorkspace enabled={isPlatformAdminUser} />
    </div>
  );
}
