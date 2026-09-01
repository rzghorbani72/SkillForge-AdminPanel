'use client';

import { usePathname } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/components/providers/user-provider';
import { isPlatformStaff } from '@/lib/roles';
import { AcademyOnboarding } from '@/components/dashboard/onboarding/academy-onboarding';

/**
 * Routes a user with no academy can still reach. Everything else in the panel
 * reads or writes academy-scoped data — those endpoints reject a request with no
 * academy context — so the rest of the panel shows the "create your first
 * academy" call to action in place of the page.
 */
const ACADEMY_LESS_PATHS = [
  '/dashboard',
  '/academies',
  '/settings/profile',
  '/settings/security'
];

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
  const pathname = usePathname();
  const { academies, isLoading } = useStore();
  const { user } = useAuthUser();

  const mustCreateAcademy =
    !isLoading &&
    !!user &&
    !isPlatformStaff(user) &&
    academies.length === 0 &&
    !isAcademyLessPath(pathname);

  // Showing the call to action in place of the page beats bouncing to the
  // dashboard: the user keeps the URL they asked for and sees exactly one next
  // step instead of a redirect they did not ask for.
  if (mustCreateAcademy) {
    return (
      <div className="p-4 sm:p-6">
        <AcademyOnboarding />
      </div>
    );
  }

  return <>{children}</>;
}
