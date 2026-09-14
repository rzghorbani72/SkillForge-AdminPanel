'use client';

import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { StaffTicketDetail } from './staff-support-types';
import { ticketEventText } from './ticket-event-text';

interface Props {
  ticket: StaffTicketDetail;
}

export function TicketMessageThread({ ticket }: Props) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const imgUrl = (attachmentId: string) =>
    `${getBrowserApiBaseUrl()}/support/tickets/${encodeURIComponent(ticket.id)}/attachments/${encodeURIComponent(attachmentId)}`;

  return (
    <ul className="flex-1 space-y-3 overflow-y-auto pe-1">
      {ticket.Message.map((m) =>
        m.kind === 'SYSTEM_EVENT' ? (
          <li key={m.id} className="flex items-center gap-2 text-center">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-muted-foreground">{ticketEventText(m, t)}</span>
            <span className="h-px flex-1 bg-border" />
          </li>
        ) : (
          <li
            key={m.id}
            className={`rounded-lg border p-3 text-sm ${
              m.kind === 'INTERNAL_NOTE'
                ? 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'
                : 'bg-muted/50'
            }`}
          >
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{m.Author?.display_name ?? '—'}</span>
              <span>
                {formatDate(m.created_at, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {m.kind === 'INTERNAL_NOTE' && (
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] text-amber-900">
                  {t('support.internalNote')}
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap break-words">{m.body}</p>
            {m.Attachment.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.Attachment.map((a) => (
                  <a key={a.id} href={imgUrl(a.id)} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl(a.id)}
                      alt=""
                      className="h-16 w-16 rounded-md border object-cover transition-opacity hover:opacity-80"
                    />
                  </a>
                ))}
              </div>
            )}
          </li>
        ),
      )}
    </ul>
  );
}
