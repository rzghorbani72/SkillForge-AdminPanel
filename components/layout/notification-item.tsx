'use client';

import Link from 'next/link';
import type { PanelNotification } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { localizeNotificationText } from '@/lib/i18n/localize-notification-text';
import { notificationHref } from '@/lib/notifications/notification-href';
import { cn } from '@/lib/utils';

interface Props {
  notification: PanelNotification;
  onOpen: (notification: PanelNotification) => void;
}

export function NotificationItem({ notification: n, onOpen }: Props) {
  const { language } = useTranslation();
  const formatDate = useDateFormat();
  const href = notificationHref(n.link);
  const className = cn(
    'block w-full border-b px-3 py-2 text-start text-sm transition-colors hover:bg-muted/50',
    !n.is_read && 'bg-primary/5',
  );
  const body = (
    <>
      <p className="font-medium">{localizeNotificationText(n.title, language, formatDate)}</p>
      <p className="line-clamp-2 text-xs text-muted-foreground">
        {localizeNotificationText(n.message, language, formatDate)}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {formatDate(n.created_at, { hour: '2-digit', minute: '2-digit' })}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={() => onOpen(n)} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => onOpen(n)} className={className}>
      {body}
    </button>
  );
}
