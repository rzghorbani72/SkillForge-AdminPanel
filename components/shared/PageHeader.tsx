'use client';

import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScopeBadge } from '@/components/settings/scope-badge';
import type { SettingsScope } from '@/lib/settings-scope';

interface PageHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
  badge?: string;
  icon?: ReactNode;
  className?: string;
  /**
   * Whose data this page shows. Optional so existing callers are untouched;
   * pass it where confusing one academy for another would be costly.
   */
  scope?: SettingsScope;
}

export function PageHeader({
  title,
  description,
  children,
  badge,
  icon,
  className,
  scope
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'fade-in-up flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                {title}
              </h1>
              {scope && <ScopeBadge scope={scope} />}
              {badge && (
                <Badge
                  variant="secondary"
                  className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary sm:flex"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </div>
      </div>
      {children && (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
