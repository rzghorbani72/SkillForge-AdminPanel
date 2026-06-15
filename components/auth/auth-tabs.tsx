'use client';

import Link from '@/components/ui/link';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

export type AuthTab = 'login' | 'register' | 'forgot';

const TABS: { key: AuthTab; href: string; labelKey: string }[] = [
  { key: 'login', href: '/login', labelKey: 'auth.signIn' },
  { key: 'register', href: '/register', labelKey: 'auth.register' },
  { key: 'forgot', href: '/forget-password', labelKey: 'auth.forgotTab' }
];

export function AuthTabs({ active }: { active: AuthTab }) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            'rounded-lg py-2 text-center text-sm font-medium transition-colors',
            tab.key === active
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t(tab.labelKey)}
        </Link>
      ))}
    </div>
  );
}
