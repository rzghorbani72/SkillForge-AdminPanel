'use client';

import { cn } from '@/lib/utils';

type Status =
  | 'success'
  | 'pending'
  | 'failed'
  | 'active'
  | 'inactive'
  | 'draft'
  | 'published';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
}

const STATUS_CONFIG: Record<Status, { label: string; classes: string }> = {
  success: {
    label: 'Success',
    classes:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20'
  },
  pending: {
    label: 'Pending',
    classes:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20'
  },
  failed: {
    label: 'Failed',
    classes: 'bg-destructive/10 text-destructive ring-destructive/20'
  },
  active: {
    label: 'Active',
    classes:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20'
  },
  inactive: {
    label: 'Inactive',
    classes: 'bg-muted text-muted-foreground ring-border'
  },
  draft: {
    label: 'Draft',
    classes: 'bg-muted text-muted-foreground ring-border'
  },
  published: {
    label: 'Published',
    classes: 'bg-primary/10 text-primary ring-primary/20'
  }
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.classes,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? config.label}
    </span>
  );
}
