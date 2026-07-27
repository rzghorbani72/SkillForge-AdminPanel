'use client';

import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthLogo } from '@/components/auth/auth-logo';
import type { AuthTab } from '@/components/auth/auth-tabs';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  activeTab: AuthTab;
  title: string;
  subtitle?: React.ReactNode;
  centerTitle?: boolean;
  children: React.ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  centerTitle = false,
  children
}: AuthShellProps) {
  return (
    <AuthLayout>
      <div className="auth-card fade-in-up flex flex-col gap-4 rounded-3xl p-6 sm:p-12">
        <AuthLogo className="self-center" />

        <div className={cn('px-4', centerTitle ? 'text-center' : 'text-start')}>
          <h1 className="text-lg font-bold leading-8 text-[#181C20]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </AuthLayout>
  );
}
