'use client';

import { usePathname } from 'next/navigation';
import { Globe2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { ScopeBadge } from '@/components/settings/scope-badge';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useHasStore } from '@/hooks/useHasStore';
import { isPlatformMode } from '@/lib/nav-filter';
import { cn } from '@/lib/utils';

/**
 * Routes whose data spans academies rather than belonging to one. Everything
 * else in the panel is academy-scoped, so the default is "you are looking at
 * <Academy>" and this list is the exception.
 */
const PLATFORM_SCOPED_PREFIXES = [
  '/platform',
  '/platform-settings',
  '/billing',
  '/subscriptions',
  '/financial/platform',
  '/support-access-logs',
  '/withdrawals',
  '/teacher-payouts',
  '/academies',
  '/user/academies',
  '/onboarding'
];

/**
 * Routes that live under a platform prefix but serve both modes. A manager on
 * /platform/roles is editing their own academy's roles, so claiming
 * "platform-wide" there is wrong.
 */
const DUAL_SCOPED_PREFIXES = ['/platform/roles'];

function matches(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isPlatformScoped(pathname: string, platformMode: boolean): boolean {
  if (matches(pathname, DUAL_SCOPED_PREFIXES)) return platformMode;
  return matches(pathname, PLATFORM_SCOPED_PREFIXES);
}

/**
 * Warns that the page below spans academies instead of belonging to one.
 * Academy-scoped pages need no banner: the header switcher already names the
 * academy being viewed.
 */
export function ScopeContextBanner({ className }: { className?: string }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user } = useAuthUser();
  const hasStore = useHasStore();

  if (!isPlatformScoped(pathname, isPlatformMode(user?.role ?? null, hasStore)))
    return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 border-b bg-muted/30 px-6 py-2 text-sm',
        className
      )}
    >
      <Globe2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{t('scope.platformWide')}</span>
      <ScopeBadge scope="platform" className="ms-auto" />
    </div>
  );
}
