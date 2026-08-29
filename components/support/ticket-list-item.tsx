'use client';

import { MessageSquare, UserRound } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import {
  ticketResponsible,
  type StaffTicketListItem
} from './staff-support-types';
import { TicketPriorityDot, TicketStatusBadge } from './ticket-badges';

interface Props {
  ticket: StaffTicketListItem;
  active: boolean;
  onSelect: () => void;
}

export function TicketListItem({ ticket, active, onSelect }: Props) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const responsible = ticketResponsible(ticket);

  const who = ticket.Academy
    ? `${ticket.Academy.name} · ${ticket.CreatedBy?.display_name ?? '—'}`
    : (ticket.CreatedBy?.display_name ?? '—');

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg border p-3 text-start transition-colors hover:bg-muted/60',
        active && 'border-primary bg-primary/5 hover:bg-primary/5'
      )}
    >
      <div className="flex items-center gap-2">
        <TicketPriorityDot priority={ticket.priority} />
        <span className="flex-1 truncate text-sm font-medium">
          {ticket.subject}
        </span>
        <TicketStatusBadge status={ticket.status} />
      </div>
      <p className="mt-1 truncate text-xs text-muted-foreground">{who}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
          {t(`support.categories.${ticket.category}`)}
        </span>
        {/* Unclaimed is the state staff must act on, so it is said out loud. */}
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]',
            responsible
              ? 'text-muted-foreground'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
          )}
        >
          <UserRound className="h-3 w-3" />
          {responsible?.display_name ?? t('support.unassigned')}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {formatNumber(ticket._count?.Message ?? 0)}
        </span>
        <span>
          {formatDate(ticket.last_activity_at, {
            year: undefined,
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </button>
  );
}
