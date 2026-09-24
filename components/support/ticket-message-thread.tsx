'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imgUrl = (attachmentId: string) =>
    `${getBrowserApiBaseUrl()}/support/tickets/${encodeURIComponent(ticket.id)}/attachments/${encodeURIComponent(attachmentId)}`;

  return (
    <>
      <ul className="flex-1 space-y-3 pe-1">
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
                  {m.Attachment.map((a) => {
                    const url = imgUrl(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setPreviewUrl(url)}
                        aria-label={t('media.imagePreview')}
                        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt=""
                          className="h-16 w-16 rounded-md border object-cover transition-opacity hover:opacity-80"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </li>
          ),
        )}
      </ul>

      <Dialog
        open={previewUrl != null}
        onOpenChange={(open) => {
          if (!open) setPreviewUrl(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] max-w-[min(90vw,56rem)] overflow-hidden p-2 sm:p-3">
          <DialogTitle className="sr-only">{t('media.imagePreview')}</DialogTitle>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="mx-auto max-h-[calc(90dvh-2rem)] w-auto max-w-full rounded-md object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
