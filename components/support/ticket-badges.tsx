'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { TicketPriority, TicketStatus } from './staff-support-types';

const STATUS_CLASS: Record<TicketStatus, string> = {
  OPEN: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  IN_PROGRESS:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  WAITING_ON_USER:
    'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  RESOLVED:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  CLOSED: 'bg-muted text-muted-foreground',
  REOPENED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
};

const PRIORITY_CLASS: Record<TicketPriority, string> = {
  LOW: 'bg-muted-foreground/40',
  NORMAL: 'bg-sky-500',
  HIGH: 'bg-amber-500',
  URGENT: 'bg-rose-500'
};

export function TicketStatusBadge({
  status,
  className
}: {
  status: TicketStatus;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        STATUS_CLASS[status],
        className
      )}
    >
      {t(`support.statuses.${status}`)}
    </span>
  );
}

export function TicketPriorityDot({ priority }: { priority: TicketPriority }) {
  const { t } = useTranslation();
  return (
    <span
      title={t(`support.priorities.${priority}`)}
      className={cn('h-2 w-2 shrink-0 rounded-full', PRIORITY_CLASS[priority])}
    />
  );
}
