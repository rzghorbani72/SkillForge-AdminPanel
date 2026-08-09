'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/components/providers/user-provider';
import { isPlatformStaff } from '@/lib/roles';

/**
 * Routes a user with no academy can still reach. Everything else in the panel
 * reads or writes academy-scoped data — those endpoints reject a request with no
 * academy context — so the rest of the panel sends them back to the dashboard,
 * where the onboarding dialog or banner explains what to do next.
 */
const ACADEMY_LESS_PATHS = [
  '/dashboard',
  '/academies',
  '/settings/profile',
  '/settings/security'
];

const FALLBACK_PATH = '/dashboard';

function isAcademyLessPath(pathname: string): boolean {
  return ACADEMY_LESS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * Keeps an academy-less user inside the handful of pages that work without a
 * tenant. Platform staff are exempt: they work in platform mode and are meant to
 * have no academy of their own.
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

  const mustRedirect =
    !isLoading &&
    !!user &&
    !isPlatformStaff(user) &&
    academies.length === 0 &&
    !isAcademyLessPath(pathname);

  useEffect(() => {
    if (mustRedirect) router.replace(FALLBACK_PATH);
  }, [mustRedirect, router]);

  if (mustRedirect) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
