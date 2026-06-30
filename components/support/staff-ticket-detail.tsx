'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  StaffTicketDetail as StaffTicketDetailData,
  TicketMessage,
  Responsible,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  CALL_STATUSES
} from './staff-support-types';

const field =
  'rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring';

function systemText(m: TicketMessage, t: (k: string) => string): string {
  const meta = m.system_meta ?? {};
  const fill = (k: string) =>
    t(k)
      .replace('{from}', meta.from_name ?? '—')
      .replace('{to}', meta.to_name ?? '—')
      .replace('{by}', meta.by_name ?? '—');
  if (m.system_event_type === 'reassigned')
    return meta.from_name
      ? fill('support.responsibleChanged')
      : fill('support.responsibleAssigned');
  return t('support.callRequested');
}

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
  const [callNote, setCallNote] = useState('');
  const [busy, setBusy] = useState(false);
  const imgUrl = (id: string) =>
    `${getBrowserApiBaseUrl()}/images/get-image?id=${encodeURIComponent(id)}`;

  const load = useCallback(async () => {
    const data = await apiClient.getSupportTicket(ticketId);
    setTicket(data);
    if (data?.scope === 'ACADEMY' && data?.capabilities?.canReassign) {
      apiClient
        .listSupportResponsibles()
        .then(setResponsibles)
        .catch(() => undefined);
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

  if (!ticket)
    return (
      <p className="p-4 text-sm text-muted-foreground">
        {t('support.loading')}
      </p>
    );
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

      {/* staff controls */}
      {caps.canManage && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={t('support.changeStatus')}
            className={field}
            value={ticket.status}
            disabled={busy}
            onChange={(e) =>
              act(() => apiClient.changeSupportStatus(ticketId, e.target.value))
            }
          >
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`support.statuses.${s}`)}
              </option>
            ))}
          </select>
          <select
            aria-label={t('support.changePriority')}
            className={field}
            value={ticket.priority}
            disabled={busy}
            onChange={(e) =>
              act(() =>
                apiClient.changeSupportPriority(ticketId, e.target.value)
              )
            }
          >
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {t(`support.priorities.${p}`)}
              </option>
            ))}
          </select>
          {caps.canReassign && ticket.scope === 'ACADEMY' && (
            <select
              aria-label={t('support.reassign')}
              className={field}
              value={ticket.AssignedTo?.id ?? ''}
              disabled={busy}
              onChange={(e) =>
                e.target.value &&
                act(() =>
                  apiClient.reassignSupportTicket(ticketId, e.target.value)
                )
              }
            >
              {responsibles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.display_name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* thread */}
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {ticket.Message.map((m) =>
          m.kind === 'SYSTEM_EVENT' ? (
            <li
              key={m.id}
              className="text-center text-xs text-muted-foreground"
            >
              {systemText(m, t)}
            </li>
          ) : (
            <li
              key={m.id}
              className={`rounded-md p-2 text-sm ${m.kind === 'INTERNAL_NOTE' ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-muted'}`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {m.Author?.display_name ?? '—'}
                </span>
                <span>{new Date(m.created_at).toLocaleString()}</span>
                {m.kind === 'INTERNAL_NOTE' && (
                  <span className="rounded bg-amber-200 px-1 text-amber-800">
                    {t('support.internalNote')}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              {m.Attachment.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.Attachment.map((a) => (
                    <a
                      key={a.id}
                      href={imgUrl(a.image_id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl(a.image_id)}
                        alt=""
                        className="h-16 w-16 rounded border object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </li>
          )
        )}
      </ul>

      {/* call requests */}
      {ticket.CallRequest.length > 0 && caps.canManage && (
        <div className="rounded-md border p-2 text-xs">
          <p className="mb-1 font-medium">
            📞 {ticket.CallRequest[0].phone} ·{' '}
            {t(`support.callStatuses.${ticket.CallRequest[0].status}`)}
          </p>
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
                  act(async () => {
                    await apiClient.logSupportCall(ticketId, {
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
      )}

      {/* reply box */}
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
