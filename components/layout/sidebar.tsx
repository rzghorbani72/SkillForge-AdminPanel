'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { filterNavItemsByRole } from '@/lib/nav-filter';
import { useAuthUser } from '@/hooks/useAuthUser';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const { user, isLoading } = useAuthUser();

  // Extract role from authenticated user (fetched from API using JWT cookie)
  const userRole = useMemo(() => {
    if (!user) return null;
    return user.role;
  }, [user]);

  // Check if admin is platform-level (AdminProfile) or has a store
  const hasStore = useMemo(() => {
    if (!user || userRole !== 'ADMIN') return undefined;

    // Use explicit flags from API response (preferred method)
    const isAdminProfile =
      user.isAdminProfile ?? user.profile?.isAdminProfile ?? false;
    const platformLevel =
      user.platformLevel ?? user.profile?.platformLevel ?? false;

    // If explicitly marked as platform-level admin, they have no store
    if (isAdminProfile || platformLevel) {
      return false; // Platform-level admin has no store
    }

    // Fallback: Check if profile has store information
    const profile = (user as any)?.profile;
    const storeId =
      profile?.store_id ?? profile?.storeId ?? user.storeId ?? null;
    const currentStore = profile?.store ?? null;

    // If storeId is 0, null, or undefined, and no store object, admin has no store
    if (storeId === null || storeId === undefined || storeId === 0) {
      if (!currentStore) {
        return false; // Admin has no store
      }
    }

    // If storeId exists and is not 0/null, admin has a store
    if (storeId !== null && storeId !== undefined && storeId !== 0) {
      return true;
    }

    // If store object exists, admin has a store
    if (currentStore && currentStore.id) {
      return true;
    }

    // Default to false if we can't determine
    return false;
  }, [user, userRole]);

  const filteredNavItems = useMemo(() => {
    return filterNavItemsByRole(navItems, userRole, hasStore);
  }, [userRole, hasStore]);

  // Show loading state while fetching user
  if (isLoading) {
    return (
      <aside
        className={cn(
          'relative hidden h-screen flex-none border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] transition-all duration-300 ease-out md:block',
          !isMinimized ? 'w-72' : 'w-[72px]',
          className
        )}
      >
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </aside>
    );
  }

  const handleToggle = () => {
    toggle();
  };

  return (
    <aside
      className={cn(
        'relative hidden h-screen flex-none border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] transition-all duration-300 ease-out md:block',
        !isMinimized ? 'w-72' : 'w-[72px]',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.02]" />

      {/* Logo section */}
      <div
        className={cn(
          'relative flex items-center gap-3 border-b border-[hsl(var(--sidebar-border))] px-4 py-5 transition-all duration-300',
          isMinimized && 'justify-center px-2'
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div
          className={cn(
            'flex flex-col transition-all duration-300',
            isMinimized && 'hidden'
          )}
        >
          <span className="text-lg font-bold tracking-tight">
            {userRole ?? ''}
          </span>
          <span className="text-xs text-muted-foreground">Dashboard</span>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className={cn(
          'absolute -right-3 top-[5.5rem] z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg',
          isMinimized && 'rotate-180'
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {/* Navigation */}
      <div className="beautiful-scrollbar h-[calc(100vh-88px)] overflow-y-auto px-3 py-4">
        <Suspense
          fallback={
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          }
        >
          <DashboardNav items={filteredNavItems} />
        </Suspense>
      </div>
    </aside>
  );
}
