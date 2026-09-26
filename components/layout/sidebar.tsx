'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { Suspense, useEffect, useMemo } from 'react';
import { filterNavItems } from '@/lib/nav-filter';
import { isPaymentEnabled } from '@/lib/payment';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { useHasStore } from '@/hooks/useHasStore';
import { useHasAcademy } from '@/hooks/useHasAcademy';
import { SidebarUpgradeBanner } from '@/components/layout/sidebar-upgrade-banner';
import { useLearningNavCapabilities } from '@/hooks/useLearningNavCapabilities';
import { usePendingSettlementCount } from '@/hooks/usePendingSettlementCount';
import { withPendingSettlementBadge } from '@/lib/nav-badges';

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

  useEffect(() => {
    void useSidebar.persist.rehydrate();
  }, []);

  const hasStore = useHasStore();
  const { visibility: learningVisibility } = useLearningNavCapabilities();
  const hasAcademy = useHasAcademy();
  const pendingSettlements = usePendingSettlementCount();

  const filteredNavItems = useMemo(() => {
    const items = filterNavItems(navItems, {
      role: userRole,
      hasStore,
      learningVisibility,
      hasAcademy,
    });
    return withPendingSettlementBadge(items, pendingSettlements);
  }, [userRole, hasStore, learningVisibility, hasAcademy, pendingSettlements]);

  if (isLoading) {
    return (
      <aside
        className={cn(
          'relative hidden h-full flex-none border-e border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] transition-all duration-300 ease-out md:block',
          !isMinimized ? 'w-[228px]' : 'w-[64px]',
          className,
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
        'relative hidden h-full flex-none flex-col border-e border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] transition-all duration-300 ease-out md:flex',
        !isMinimized ? 'w-[228px]' : 'w-[64px]',
        className,
      )}
    >
      {/* Product brand — academy identity lives in the header switcher */}
      <div
        className={cn(
          'flex items-center gap-2.5 border-b border-[hsl(var(--sidebar-border))] px-3 py-3 transition-all duration-300',
          isMinimized && 'justify-center px-2',
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.svg" alt="" aria-hidden className="h-8 w-8 shrink-0" />
        {!isMinimized && (
          <div className="min-w-0 flex-1">
            <span
              aria-hidden
              className="block h-[18px] w-[44px] bg-foreground"
              style={{
                WebkitMask: 'url(/logo-type.png) center / contain no-repeat',
                mask: 'url(/logo-type.png) center / contain no-repeat',
              }}
            />
            <span className="sr-only">{t('auth.brandName')}</span>
            <p className="truncate text-[10px] leading-tight text-muted-foreground">
              {isPlatformMode ? t('sidebar.managementConsole') : t('auth.brandTagline')}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={toggle}
        className={cn(
          'absolute -end-3 top-4 z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md transition-all duration-300 hover:bg-primary hover:text-white',
          !isMinimized && 'rotate-180',
        )}
        aria-label="Toggle sidebar"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {/* Navigation — ps-3 gives room for the 3px active bar on the start edge */}
      <div className="beautiful-scrollbar flex-1 overflow-y-auto py-2 pe-2 ps-3">
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
