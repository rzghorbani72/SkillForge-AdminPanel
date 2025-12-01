import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/utils';
import { MobileSidebar } from './mobile-sidebar';
import { UserNav } from './user-nav';
import { SchoolSelector } from './school-selector';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function Header() {
  return (
    <header className="sticky inset-x-0 top-0 w-full">
      <nav className="flex items-center justify-between px-4 py-2 md:justify-between">
        <div className={cn('block md:!hidden')}>
          <MobileSidebar />
        </div>
        <div className="flex items-center gap-4">
          <SchoolSelector />
          <LanguageSwitcher />
          <UserNav />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
