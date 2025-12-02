'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-1 items-center justify-center p-6', className)}
    >
      <div className="fade-in-up text-center">
        {/* Decorative background */}
        <div className="relative mx-auto mb-6">
          <div className="absolute inset-0 -z-10 mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-2xl" />
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 text-muted-foreground shadow-sm">
            {icon}
          </div>
        </div>

        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>

        {(action || (actionLabel && onAction)) && (
          <div className="mt-6">
            {action || (
              <Button onClick={onAction} className="gap-2">
                <Plus className="h-4 w-4" />
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
