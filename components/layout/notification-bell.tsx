'use client';

import { useEffect, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { apiClient, PanelNotification } from '@/lib/api';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t('notifications.bell.title')}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute end-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground ring-2 ring-background">
              {unread > 9
                ? `${(9).toLocaleString(locale)}+`
                : unread.toLocaleString(locale)}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
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
                <p className="font-medium">{n.title}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {n.message}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleString(locale)}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
