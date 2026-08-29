'use client';

import { MobileSidebar } from './mobile-sidebar';
import { UserNav } from './user-nav';
import { AcademySelector } from './AcademySelector';
import { NotificationBell } from './notification-bell';
import { HeaderUpgradeButton } from './header-upgrade-button';
import { HeaderPlanBadge } from './header-plan-badge';
import { VisitSiteLink } from '@/components/shared/visit-site-link';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';

export default function Header() {
  const academy = useCurrentAcademy();

  return (
    <header className="sticky inset-x-0 top-0 z-40 w-full">
      <nav className="flex h-16 items-center justify-between border-b border-[hsl(var(--sidebar-border))] bg-background/95 px-4 backdrop-blur-xl md:px-6">
        {/* Left — mobile trigger */}
        <div className="flex items-center gap-3">
          <div className="block md:hidden">
            <MobileSidebar />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <AcademySelector />
          <VisitSiteLink
            academy={academy}
            iconOnly
            className="hidden rounded-full sm:inline-flex"
          />
          <div className="hidden h-6 w-px bg-border/50 sm:block" />

          <HeaderPlanBadge />
          <HeaderUpgradeButton />

          {/* Notification bell */}
          <NotificationBell />

          <div className="hidden h-6 w-px bg-border/50 sm:block" />

          <UserNav />
        </div>
      </nav>
    </header>
  );
}
