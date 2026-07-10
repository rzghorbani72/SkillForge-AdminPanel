'use client';

import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/utils';
import { MobileSidebar } from './mobile-sidebar';
import { UserNav } from './user-nav';
import { AcademySelector } from './AcademySelector';
import { NotificationBell } from './notification-bell';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';

export default function Header() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky inset-x-0 top-0 z-40 w-full">
      <nav className="flex h-16 items-center justify-between border-b border-[hsl(var(--sidebar-border))] bg-background/95 px-4 backdrop-blur-xl md:px-6">
        {/* Left — mobile trigger / search */}
        <div className="flex items-center gap-3">
          <div className="block md:hidden">
            <MobileSidebar />
          </div>

          {/* Search bar */}
          <div className="relative hidden max-w-[420px] sm:flex">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search') || 'Search…'}
              className={cn(
                'h-9 w-64 rounded-xl border border-border/60 bg-muted/50 pe-4 ps-9 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/40',
                'transition-all duration-200 focus:w-80'
              )}
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <AcademySelector />
          <div className="h-6 w-px bg-border/50" />

          {/* <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div> */}

          {/* Notification bell */}
          <NotificationBell />

          <div className="h-6 w-px bg-border/50" />

          <UserNav />
        </div>
      </nav>
    </header>
  );
}
