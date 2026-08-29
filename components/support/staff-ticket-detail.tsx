'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from '@/components/ui/link';
import { Crown } from 'lucide-react';
import {
  Responsible,
  StaffTicketDetail as StaffTicketDetailData
} from './staff-support-types';
import { TicketStaffControls } from './ticket-staff-controls';
import { TicketCallPanel } from './ticket-call-panel';
import { TicketMessageThread } from './ticket-message-thread';
import { TicketPriorityDot, TicketStatusBadge } from './ticket-badges';

interface Props {
  ticketId: string;
  onChanged: () => void;
}

export function StaffTicketDetail({ ticketId, onChanged }: Props) {
  const { t } = useTranslation();
  const [ticket, setTicket] = useState<StaffTicketDetailData | null>(null);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [body, setBody] = useState('');
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await apiClient.getSupportTicket(ticketId);
    setTicket(data);
    if (data?.capabilities?.canReassign) {
      const loader =
        data.scope === 'PLATFORM'
          ? apiClient.getPlatformResponsibles()
          : apiClient.listSupportResponsibles();
      loader.then(setResponsibles).catch(() => undefined);
    }
  }, [ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await load();
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const sendReply = () =>
    body.trim() &&
    act(async () => {
      await apiClient.replySupportTicket(ticketId, {
        body,
        internal_note: internal
      });
      setBody('');
      setInternal(false);
    });

  // Capabilities decide what renders below, so a payload without them is not
  // a usable ticket — never a half-rendered one.
  if (!ticket?.capabilities) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        {t('support.loading')}
      </p>
    );
  }

  const caps = ticket.capabilities;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold">
            <TicketPriorityDot priority={ticket.priority} />
            {ticket.subject}
          </h3>
          <p className="text-xs text-muted-foreground">
            {ticket.Academy ? `${ticket.Academy.name} · ` : ''}
            {t('support.from')}: {ticket.CreatedBy?.display_name ?? '—'}
            {ticket.AssignedTo
              ? ` · ${t('support.responsible')}: ${ticket.AssignedTo.display_name}`
              : ''}
          </p>
          {/* Closing a plan deal ends on the academy's custom-plan card, so
              the ticket links straight there instead of making staff search. */}
          {caps.isPlatformStaff && ticket.Academy && (
            <Link
              href={`/platform/academies?academyId=${ticket.Academy.id}`}
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Crown className="h-3 w-3" />
              {t('support.openAcademyPlan')}
            </Link>
          )}
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      {ticket.Rating && (
        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <span className="font-medium">{t('support.csat')}:</span>{' '}
          {'★'.repeat(ticket.Rating.score)}
          {'☆'.repeat(5 - ticket.Rating.score)}
          {ticket.Rating.comment && (
            <p className="mt-1 text-muted-foreground">
              {ticket.Rating.comment}
            </p>
          )}
        </div>
      )}

      <TicketStaffControls
        ticket={ticket}
        responsibles={responsibles}
        busy={busy}
        onAct={act}
      />

      <TicketMessageThread ticket={ticket} />
      <TicketCallPanel ticket={ticket} busy={busy} onAct={act} />

      {caps.canReply && ticket.status !== 'CLOSED' && (
        <div className="space-y-2 border-t pt-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={5000}
            placeholder={t('support.replyPlaceholder')}
          />
          <div className="flex items-center justify-between">
            {caps.canInternalNote ? (
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={internal}
                  onChange={(e) => setInternal(e.target.checked)}
                />
                {t('support.internalNote')}
              </label>
            ) : (
              <span />
            )}
            <Button
              size="sm"
              disabled={busy || !body.trim()}
              onClick={sendReply}
            >
              {t('support.send')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
