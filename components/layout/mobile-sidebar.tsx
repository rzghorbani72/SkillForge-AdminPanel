'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navItems } from '@/constants/data';
import { MenuIcon } from 'lucide-react';
import { useState, Suspense, useMemo } from 'react';
import { filterNavItemsByRole } from '@/lib/nav-filter';
import { useAuthUser } from '@/hooks/useAuthUser';

// import { Playlist } from "../data/playlists";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuthUser();

  // Extract role from authenticated user (fetched from API using JWT cookie)
  const userRole = useMemo(() => {
    if (!user) return null;
    return user.role;
  }, [user]);

  const filteredNavItems = useMemo(() => {
    return filterNavItemsByRole(navItems, userRole);
  }, [userRole]);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="focus:outline-none">
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Overview
              </h2>
              <div className="space-y-1">
                <Suspense
                  fallback={
                    <div className="p-4 text-center text-muted-foreground">
                      Loading...
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
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
