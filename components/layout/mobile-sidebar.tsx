'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navItems } from '@/constants/data';
import { MenuIcon } from 'lucide-react';
import { useState, Suspense, useMemo } from 'react';
import { filterNavItems } from '@/lib/nav-filter';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useHasStore } from '@/hooks/useHasStore';
import { useLearningNavCapabilities } from '@/hooks/useLearningNavCapabilities';
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const hasStore = useHasStore();
  const { visibility: learningVisibility } = useLearningNavCapabilities();

  const userRole = useMemo(() => {
    if (!user) return null;
    return user.role;
  }, [user]);

  const filteredNavItems = useMemo(() => {
    return filterNavItems(navItems, {
      role: userRole,
      hasStore,
      learningVisibility
    });
  }, [userRole, hasStore, learningVisibility]);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="focus:outline-none">
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side={isRTL ? 'right' : 'left'} className="!px-0">
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
