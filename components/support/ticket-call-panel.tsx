'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import {
  CALL_STATUSES,
  StaffTicketDetail,
  TicketCallRequest
} from './staff-support-types';

const field =
  'rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring';

interface Props {
  ticket: StaffTicketDetail;
  busy: boolean;
  onAct: (fn: () => Promise<unknown>) => void;
}

function CallRow({
  call,
  t
}: {
  call: TicketCallRequest;
  t: (k: string) => string;
}) {
  return (
    <div className="rounded border bg-background/50 p-2">
      <p className="font-medium">
        📞 {call.phone} · {t(`support.callStatuses.${call.status}`)}
      </p>
      {call.called_at && (
        <p className="text-muted-foreground">
          {new Date(call.called_at).toLocaleString()}
        </p>
      )}
      {call.outcome_note && (
        <p className="mt-1 whitespace-pre-wrap">{call.outcome_note}</p>
      )}
    </div>
  );
}

export function TicketCallPanel({ ticket, busy, onAct }: Props) {
  const { t } = useTranslation();
  const [callNote, setCallNote] = useState('');
  const [emailNote, setEmailNote] = useState('');

  if (!ticket.capabilities.canManage) return null;

  return (
    <div className="space-y-3 rounded-md border p-2 text-xs">
      {ticket.CallRequest.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium">{t('support.callHistory')}</p>
          {ticket.CallRequest.map((call) => (
            <CallRow key={call.id} call={call} t={t} />
          ))}
        </div>
      )}

      <div className="space-y-2 border-t pt-2">
        <p className="font-medium">{t('support.logCall')}</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className={field}
            placeholder={t('support.callOutcome')}
            value={callNote}
            onChange={(e) => setCallNote(e.target.value)}
          />
          {CALL_STATUSES.map((cs) => (
            <Button
              key={cs}
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                onAct(async () => {
                  await apiClient.logSupportCall(ticket.id, {
                    status: cs,
                    outcome_note: callNote || undefined
                  });
                  setCallNote('');
                })
              }
            >
              {t(`support.callStatuses.${cs}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t pt-2">
        <p className="font-medium">{t('support.logEmail')}</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className={`${field} min-w-[200px] flex-1`}
            placeholder={t('support.emailOutcome')}
            value={emailNote}
            onChange={(e) => setEmailNote(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() =>
              onAct(async () => {
                await apiClient.logSupportEmail(ticket.id, {
                  outcome_note: emailNote || undefined
                });
                setEmailNote('');
              })
            }
          >
            {t('support.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
