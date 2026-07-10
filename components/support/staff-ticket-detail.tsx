'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Responsible,
  StaffTicketDetail as StaffTicketDetailData
} from './staff-support-types';
import { TicketStaffControls } from './ticket-staff-controls';
import { TicketCallPanel } from './ticket-call-panel';
import { TicketMessageThread } from './ticket-message-thread';

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

  if (!ticket) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        {t('support.loading')}
      </p>
    );
  }

  const caps = ticket.capabilities;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
        <div>
          <h3 className="font-semibold">{ticket.subject}</h3>
          <p className="text-xs text-muted-foreground">
            {t('support.from')}: {ticket.CreatedBy?.display_name ?? '—'}
            {ticket.AssignedTo
              ? ` · ${t('support.responsible')}: ${ticket.AssignedTo.display_name}`
              : ''}
          </p>
        </div>
        <Badge>{t(`support.statuses.${ticket.status}`)}</Badge>
      </div>

      {ticket.Rating && (
        <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
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
        <div className="space-y-2 border-t pt-2">
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
