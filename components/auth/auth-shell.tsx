'use client';

import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthTabs, type AuthTab } from '@/components/auth/auth-tabs';
import { useTranslation } from '@/lib/i18n/hooks';

interface AuthShellProps {
  activeTab: AuthTab;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthShell({
  activeTab,
  title,
  subtitle,
  children
}: AuthShellProps) {
  const { t } = useTranslation();

  return (
    <AuthLayout>
      <div className="auth-card fade-in-up rounded-2xl p-7">
        <header className="mb-6 flex items-center justify-start gap-3">
          <div
            className="brand-tile flex h-11 w-11 items-center justify-center rounded-xl text-xl font-extrabold text-white"
            aria-hidden
          >
            {t('auth.brandInitial')}
          </div>
          <div className="text-right">
            <h1 className="text-lg font-extrabold leading-tight">
              {t('auth.brandName')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('auth.brandTagline')}
            </p>
          </div>
        </header>

        <AuthTabs active={activeTab} />

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {children}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t('auth.footer')}
      </p>
    </AuthLayout>
  );
}
