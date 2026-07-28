'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';
import { ChevronLeft, GraduationCap } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { filterNavItems } from '@/lib/nav-filter';
import { isPaymentEnabled } from '@/lib/payment';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import Link from '@/components/ui/link';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useHasStore } from '@/hooks/useHasStore';
import { useBrandingStore } from '@/lib/store';
import { SidebarUpgradeBanner } from '@/components/layout/sidebar-upgrade-banner';
import { SidebarPlanBadge } from '@/components/layout/sidebar-plan-badge';
import { useLearningNavCapabilities } from '@/hooks/useLearningNavCapabilities';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const { user, isLoading } = useAuthUser();
  const { t } = useTranslation();
  const currentAcademy = useCurrentAcademy();
  const configLogoUrl = useBrandingStore((s) => s.logoUrl);

  const userRole = useMemo(() => {
    if (!user) return null;
    return user.role;
  }, [user]);

  const hasStore = useHasStore();
  const { visibility: learningVisibility } = useLearningNavCapabilities();

  const filteredNavItems = useMemo(() => {
    return filterNavItems(navItems, {
      role: userRole,
      hasStore,
      learningVisibility
    });
  }, [userRole, hasStore, learningVisibility]);

  if (isLoading) {
    return (
      <aside
        className={cn(
          'relative hidden h-screen flex-none border-e border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] transition-all duration-300 ease-out md:block',
          !isMinimized ? 'w-[248px]' : 'w-[72px]',
          className
        )}
      >
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </aside>
    );
  }

  const isPlatformMode = hasStore === false;
  const academyName = currentAcademy?.name || getRoleLabel(userRole, t);

  return (
    <aside
      className={cn(
        'relative hidden h-screen flex-none flex-col border-e border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] transition-all duration-300 ease-out md:flex',
        !isMinimized ? 'w-[248px]' : 'w-[72px]',
        className
      )}
    >
      {/* Brand / Academy header */}
      <div
        className={cn(
          'flex items-center gap-3 border-b border-[hsl(var(--sidebar-border))] px-4 py-4 transition-all duration-300',
          isMinimized && 'justify-center px-2'
        )}
      >
        {isPlatformMode ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/logo-mark.svg"
            alt=""
            aria-hidden
            className="h-9 w-9 shrink-0"
          />
        ) : (
          (() => {
            const raw = configLogoUrl ?? currentAcademy?.logo?.publicUrl;
            const src = raw?.startsWith('/')
              ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${raw}`
              : raw;
            return src ? (
              <img
                src={src}
                alt={academyName}
                className="h-9 w-9 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/25 transition-all duration-200">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
            );
          })()
        )}
        {!isMinimized && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {isPlatformMode
                ? t('sidebar.platformAdmin') || 'Platform Admin'
                : academyName}
            </p>
            {isPlatformMode ? (
              <p className="truncate text-xs text-muted-foreground">
                {t('sidebar.managementConsole') || 'Management Console'}
              </p>
            ) : (
              <div className="mt-1">
                <SidebarPlanBadge />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'absolute -end-3 top-[4.5rem] z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md transition-all duration-300 hover:bg-primary hover:text-white',
          isMinimized && 'rotate-180'
        )}
        aria-label="Toggle sidebar"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {/* Navigation — ps-4 gives room for the 3px active bar on the start edge */}
      <div className="beautiful-scrollbar flex-1 overflow-y-auto py-3 pe-3 ps-4">
        <Suspense
          fallback={
            <div className="p-4 text-center text-xs text-muted-foreground">
              {t('common.loading')}
            </div>
          }
        >
          <DashboardNav items={filteredNavItems} />
        </Suspense>
      </div>

      {!isPlatformMode && isPaymentEnabled ? (
        <SidebarUpgradeBanner isMinimized={isMinimized} />
      ) : null}
    </aside>
  );
}
