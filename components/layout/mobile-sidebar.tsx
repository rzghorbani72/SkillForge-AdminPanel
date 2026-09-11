'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navItems } from '@/constants/data';
import { MenuIcon } from 'lucide-react';
import { useState, Suspense, useMemo } from 'react';
import { filterNavItems } from '@/lib/nav-filter';
import { usePendingSettlementCount } from '@/hooks/usePendingSettlementCount';
import { withPendingSettlementBadge } from '@/lib/nav-badges';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useHasStore } from '@/hooks/useHasStore';
import { useHasAcademy } from '@/hooks/useHasAcademy';
import { useLearningNavCapabilities } from '@/hooks/useLearningNavCapabilities';
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const hasStore = useHasStore();
  const { visibility: learningVisibility } = useLearningNavCapabilities();
  const hasAcademy = useHasAcademy();

  const userRole = useMemo(() => {
    if (!user) return null;
    return user.role;
  }, [user]);

  const pendingSettlements = usePendingSettlementCount();

  const filteredNavItems = useMemo(() => {
    const items = filterNavItems(navItems, {
      role: userRole,
      hasStore,
      learningVisibility,
      hasAcademy
    });
    return withPendingSettlementBadge(items, pendingSettlements);
  }, [userRole, hasStore, learningVisibility, hasAcademy, pendingSettlements]);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
            aria-label={t('common.openMenu')}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side={isRTL ? 'right' : 'left'}
          className="w-[min(18rem,85vw)] !px-0"
        >
          <div className="beautiful-scrollbar h-full overflow-y-auto py-3 pe-2 ps-4">
            <Suspense
              fallback={
                <div className="p-4 text-center text-xs text-muted-foreground">
                  {t('common.loading')}
                </div>
              }
            >
              <DashboardNav
                items={filteredNavItems}
                isMobileNav={true}
                setOpen={setOpen}
              />
            </Suspense>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
