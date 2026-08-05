'use client';

import { usePathname } from 'next/navigation';
import { Building2, Globe2 } from 'lucide-react';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useTranslation } from '@/lib/i18n/hooks';
import { ScopeBadge } from '@/components/settings/scope-badge';
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

function isPlatformScoped(pathname: string): boolean {
  return PLATFORM_SCOPED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Says which academy the page below belongs to. Without it, an owner running
 * several academies cannot tell whose students, payments, or roles they are
 * editing — every page looks identical, and the only clue is a small name in
 * the header dropdown.
 */
export function ScopeContextBanner({ className }: { className?: string }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const academy = useCurrentAcademy();

  const platformScoped = isPlatformScoped(pathname);

  // Platform mode with a platform-scoped page needs no banner: there is no
  // academy to confuse it with.
  if (!academy && !platformScoped) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 border-b bg-muted/30 px-6 py-2 text-sm',
        className
      )}
    >
      {platformScoped ? (
        <>
          <Globe2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">
            {t('scope.platformWide')}
          </span>
          <ScopeBadge scope="platform" className="ms-auto" />
        </>
      ) : (
        <>
          <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">
            {t('scope.viewingAcademy')}
          </span>
          <span className="truncate font-semibold">{academy?.name}</span>
          <ScopeBadge scope="academy" className="ms-auto" />
        </>
      )}
    </div>
  );
}
