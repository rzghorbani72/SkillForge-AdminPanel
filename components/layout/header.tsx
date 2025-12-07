import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/utils';
import { MobileSidebar } from './mobile-sidebar';
import { UserNav } from './user-nav';
import { StoreSelector } from './StoreSelector';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function Header() {
  return (
    <header className="sticky inset-x-0 top-0 z-40 w-full">
      {/* Gradient line at top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <nav className="flex items-center justify-between bg-background/80 px-4 py-3 backdrop-blur-xl md:px-6">
        {/* Mobile sidebar trigger */}
        <div className={cn('block md:!hidden')}>
          <MobileSidebar />
        </div>

        {/* Spacer for desktop */}
        <div className="hidden md:block" />

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <StoreSelector />

          <div className="h-6 w-px bg-border/50" />

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          <div className="h-6 w-px bg-border/50" />

          <UserNav />
        </div>
      </nav>

      {/* Bottom border with gradient */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
    </header>
  );
}
