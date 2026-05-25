'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';
import { ChevronLeft, Zap, GraduationCap, ArrowUpRight } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { filterNavItemsByRole } from '@/lib/nav-filter';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import Link from '@/components/ui/link';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const { user, isLoading } = useAuthUser();
  const { t } = useTranslation();
  const currentAcademy = useCurrentAcademy();

  const userRole = useMemo(() => {
    if (!user) return null;
    return user.role;
  }, [user]);

  const hasStore = useMemo(() => {
    if (!user || userRole !== 'ADMIN') return undefined;

    const isAdminProfile =
      user.isAdminProfile ?? user.profile?.isAdminProfile ?? false;
    const platformLevel =
      user.platformLevel ?? user.profile?.platformLevel ?? false;

    if (isAdminProfile || platformLevel) return false;

    const profile = (user as any)?.profile;
    const academyId =
      profile?.academy_id ?? profile?.academyId ?? user.academyId ?? null;
    const currentAcademyData = profile?.academy ?? profile?.store ?? null;

    if (academyId === null || academyId === undefined || academyId === 0) {
      if (!currentAcademyData) return false;
    }
    if (academyId !== null && academyId !== undefined && academyId !== 0)
      return true;
    if (currentAcademyData && currentAcademyData.id) return true;

    return false;
  }, [user, userRole]);

  const filteredNavItems = useMemo(() => {
    return filterNavItemsByRole(navItems, userRole, hasStore);
  }, [userRole, hasStore]);

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

  const academyName = currentAcademy?.name || getRoleLabel(userRole, t);
  const academyInitial = academyName?.charAt(0)?.toUpperCase() || 'A';

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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/25 transition-all duration-200">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        {!isMinimized && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {academyName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {t('navigation.dashboard')}
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

      {/* Upgrade banner */}
      {!isMinimized && (
        <div className="p-3">
          <div className="upgrade-banner">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                {t('sidebar.upgradePlan') || 'Upgrade Plan'}
              </span>
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
              {t('sidebar.upgradeDescription') ||
                'Unlock unlimited courses & advanced analytics'}
            </p>
            <Link
              href="/plans"
              className="flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t('sidebar.upgradeButton') || 'Upgrade'}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Minimized upgrade icon */}
      {isMinimized && (
        <div className="flex justify-center p-3">
          <Link
            href="/plans"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
            title={t('sidebar.upgradePlan') || 'Upgrade'}
          >
            <Zap className="h-4 w-4" />
          </Link>
        </div>
      )}
    </aside>
  );
}
