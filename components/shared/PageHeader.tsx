'use client';

import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
  badge?: string;
  icon?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  badge,
  icon,
  className
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {icon && <div className="icon-container-primary">{icon}</div>}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h1>
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
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
