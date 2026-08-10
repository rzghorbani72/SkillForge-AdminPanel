'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { filterNavItems } from '@/lib/nav-filter';
import { isPaymentEnabled } from '@/lib/payment';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { useHasStore } from '@/hooks/useHasStore';
import { SidebarUpgradeBanner } from '@/components/layout/sidebar-upgrade-banner';
import { useLearningNavCapabilities } from '@/hooks/useLearningNavCapabilities';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const { user, isLoading } = useAuthUser();
  const { t } = useTranslation();

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

  return (
    <aside
      className={cn(
        'relative hidden h-screen flex-none flex-col border-e border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] transition-all duration-300 ease-out md:flex',
        !isMinimized ? 'w-[248px]' : 'w-[72px]',
        className
      )}
    >
      {/* Product brand — academy identity lives in the header switcher */}
      <div
        className={cn(
          'flex items-center gap-3 border-b border-[hsl(var(--sidebar-border))] px-4 py-4 transition-all duration-300',
          isMinimized && 'justify-center px-2'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.svg"
          alt=""
          aria-hidden
          className="h-9 w-9 shrink-0"
        />
        {!isMinimized && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {t('auth.brandName')}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {isPlatformMode
                ? t('sidebar.managementConsole')
                : t('auth.brandTagline')}
            </p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'absolute -end-3 top-[4.5rem] z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md transition-all duration-300 hover:bg-primary hover:text-white',
          !isMinimized && 'rotate-180'
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
