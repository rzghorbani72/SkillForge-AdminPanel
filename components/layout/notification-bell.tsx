'use client';

import { useEffect, useState } from 'react';
import { BellIcon } from '@animateicons/react/lucide/bell-icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AnimatedHoverIcon } from '@/components/layout/animated-hover-icon';
import { apiClient, PanelNotification } from '@/lib/api';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { localizeNotificationText } from '@/lib/i18n/localize-notification-text';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { t, language } = useTranslation();
  const { isRTL } = useLanguage();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<PanelNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCount = async () => {
    try {
      const count = await apiClient.getUnreadNotificationCount();
      setUnread(count);
    } catch {
      setUnread(0);
    }
  };

  const loadList = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getNotifications({ page: 1, limit: 15 });
      setItems(data?.notifications ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCount();
    const timer = window.setInterval(refreshCount, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (open) loadList();
  }, [open]);

  const markRead = async (id: string) => {
    await apiClient.markNotificationRead(id);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await refreshCount();
  };

  const markAllRead = async () => {
    await apiClient.markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const unreadLabel = unread > 9 ? `${formatNumber(9)}+` : formatNumber(unread);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
          aria-label={t('notifications.bell.title')}
        >
          <AnimatedHoverIcon
            icon={BellIcon}
            playing={hovered || open}
            size={18}
            className="text-foreground"
          />
          {unread > 0 && (
            <span
              className="absolute -end-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground"
              aria-label={unreadLabel}
            >
              {unreadLabel}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-medium">{t('notifications.bell.title')}</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllRead}
            >
              {t('notifications.bell.markAllRead')}
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t('notifications.bell.empty')}
            </p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.is_read && markRead(n.id)}
                className={cn(
                  'block w-full border-b px-3 py-2 text-start text-sm transition-colors hover:bg-muted/50',
                  !n.is_read && 'bg-primary/5'
                )}
              >
                <p className="font-medium">
                  {localizeNotificationText(n.title, language, formatDate)}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {localizeNotificationText(n.message, language, formatDate)}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatDate(n.created_at, {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
