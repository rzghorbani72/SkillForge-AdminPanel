'use client';

import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { StaffTicketDetail } from './staff-support-types';
import { ticketEventText } from './ticket-event-text';

interface Props {
  ticket: StaffTicketDetail;
}

export function TicketMessageThread({ ticket }: Props) {
  const { t } = useTranslation();
  const imgUrl = (attachmentId: string) =>
    `${getBrowserApiBaseUrl()}/support/tickets/${encodeURIComponent(ticket.id)}/attachments/${encodeURIComponent(attachmentId)}`;

  return (
    <ul className="flex-1 space-y-2 overflow-y-auto">
      {ticket.Message.map((m) =>
        m.kind === 'SYSTEM_EVENT' ? (
          <li key={m.id} className="text-center text-xs text-muted-foreground">
            {ticketEventText(m, t)}
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
                    href={imgUrl(a.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl(a.id)}
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
  );
}
