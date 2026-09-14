'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
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
  },
  paid: {
    label: 'Paid',
    classes:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20'
  },
  approved: {
    label: 'Approved',
    classes:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20'
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-destructive/10 text-destructive ring-destructive/20'
  },
  completed: {
    label: 'Completed',
    classes:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20'
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-muted text-muted-foreground ring-border'
  },
  refunded: {
    label: 'Refunded',
    classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20'
  },
  free: {
    label: 'Free',
    classes:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20'
  },
  one_time: {
    label: 'One-Time',
    classes: 'bg-primary/10 text-primary ring-primary/20'
  },
  payment_plan: {
    label: 'Payment Plan',
    classes:
      'bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20'
  },
  subscription: {
    label: 'Subscription',
    classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20'
  },
  percent: {
    label: 'Percent',
    classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20'
  },
  fixed: {
    label: 'Fixed',
    classes:
      'bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20'
  },
  free_trial: {
    label: 'Free Trial',
    classes: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-teal-500/20'
  },
  full_discount: {
    label: 'Full Discount',
    classes:
      'bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-500/20'
  }
};

const FALLBACK: { label: string; classes: string } = {
  label: '',
  classes: 'bg-muted text-muted-foreground ring-border'
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status?.toLowerCase() ?? '';
  const config = STATUS_CONFIG[key] ?? FALLBACK;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.classes,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? config.label ?? status}
    </span>
  );
}
