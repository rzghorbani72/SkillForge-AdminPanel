'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';
import { ChevronLeft, Sparkles } from 'lucide-react';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();

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
          <span className="text-lg font-bold tracking-tight">Admin</span>
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
        <DashboardNav items={navItems} />
      </div>

      {/* Bottom decorative element */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(var(--sidebar-bg))] to-transparent" />
    </aside>
  );
}
