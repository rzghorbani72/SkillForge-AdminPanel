'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/components/providers/user-provider';

export const CREATE_ACADEMY_PATH = '/onboarding/create-academy';

/**
 * Routes a manager with no academy can still reach. Everything else in the panel
 * reads or writes academy-scoped data, so without an academy it renders empty
 * shells and confusing errors — the manager is sent to create one instead.
 */
const ACADEMY_LESS_PATHS = [
  CREATE_ACADEMY_PATH,
  '/settings/profile',
  '/settings/security'
];

function isAcademyLessPath(pathname: string): boolean {
  return ACADEMY_LESS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * A brand-new manager lands in the panel owning nothing. Rather than letting
 * them wander empty pages, this pushes them to create their first academy and
 * holds the screen while the redirect happens. Platform staff are exempt: they
 * work in platform mode and are meant to have no academy of their own.
 */
export function AcademyRequiredGate({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { academies, isLoading } = useStore();
  const { user } = useAuthUser();

  const isPlatformStaff =
    !!user?.isAdminProfile ||
    !!user?.platformLevel ||
    user?.role === 'ADMIN' ||
    user?.canManagePlatform === true;

  const mustOnboard =
    !isLoading &&
    !!user &&
    !isPlatformStaff &&
    academies.length === 0 &&
    !isAcademyLessPath(pathname);

  useEffect(() => {
    if (mustOnboard) router.replace(CREATE_ACADEMY_PATH);
  }, [mustOnboard, router]);

  if (mustOnboard) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
