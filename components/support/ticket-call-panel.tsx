'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CALL_STATUSES, StaffTicketDetail, TicketCallRequest } from './staff-support-types';

interface Props {
  ticket: StaffTicketDetail;
  busy: boolean;
  onAct: (fn: () => Promise<unknown>) => void;
}

function CallRow({
  call,
  t,
  formatDate,
}: {
  call: TicketCallRequest;
  t: (k: string) => string;
  formatDate: (v: string, o?: Intl.DateTimeFormatOptions) => string;
}) {
  return (
    <div className="rounded-md border bg-background/50 p-2">
      <p className="flex items-center gap-1.5 font-medium">
        <Phone className="h-3 w-3 text-muted-foreground" />
        <span dir="ltr">{call.phone}</span>
        <span className="text-muted-foreground">· {t(`support.callStatuses.${call.status}`)}</span>
      </p>
      {call.called_at && (
        <p className="text-muted-foreground">
          {formatDate(call.called_at, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}
      {call.outcome_note && <p className="mt-1 whitespace-pre-wrap">{call.outcome_note}</p>}
    </div>
  );
}

export function TicketCallPanel({ ticket, busy, onAct }: Props) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const [callNote, setCallNote] = useState('');
  const [emailNote, setEmailNote] = useState('');

  if (!ticket.capabilities.canManage) return null;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3 text-xs">
      {ticket.CallRequest.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium">{t('support.callHistory')}</p>
          {ticket.CallRequest.map((call) => (
            <CallRow key={call.id} call={call} t={t} formatDate={formatDate} />
          ))}
        </div>
      )}

      <div className="space-y-2 border-t pt-2">
        <p className="font-medium">{t('support.logCall')}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-9 w-[200px]"
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
                    outcome_note: callNote || undefined,
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
          <Input
            className="h-9 min-w-[200px] flex-1"
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
                  outcome_note: emailNote || undefined,
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
