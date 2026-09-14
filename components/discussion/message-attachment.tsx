'use client';

import { FileText } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';

export interface ThreadAttachment {
  id: string;
  title: string;
  publicUrl: string | null;
  mime_type: string | null;
}

/** A file handed over in a chat message: images inline, anything else as a row. */
export function MessageAttachment({
  attachment,
  mine,
}: {
  attachment: ThreadAttachment;
  mine: boolean;
}) {
  const { t } = useTranslation();
  if (!attachment.publicUrl) return null;

  if (attachment.mime_type?.startsWith('image/')) {
    return (
      <a
        href={attachment.publicUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 block overflow-hidden rounded-md"
        aria-label={t('discussion.openAttachment')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.publicUrl}
          alt={attachment.title}
          className="max-h-60 w-auto max-w-full object-contain"
        />
      </a>
    );
  }

  return (
    <a
      href={attachment.publicUrl}
      target="_blank"
      rel="noreferrer"
      className={`mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs underline-offset-2 hover:underline ${mine ? 'bg-white/15' : 'bg-black/5 dark:bg-white/10'}`}
    >
      <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{attachment.title}</span>
    </a>
  );
}
